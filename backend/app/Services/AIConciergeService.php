<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class AIConciergeService
{
    public function generateRecommendation(string $goal, array $context = []): string
    {
        $sanitizedGoal = $this->sanitizeGoal($goal);

        if ($sanitizedGoal === '') {
            throw new RuntimeException('Please provide a valid fitness goal.');
        }

        $config = config('ai.concierge');
        $provider = strtolower((string) ($config['provider'] ?? 'gemini'));

        try {
            $text = match ($provider) {
                'ollama' => $this->generateWithOllama($sanitizedGoal, $context, $config),
                'gemini' => $this->generateWithGemini($sanitizedGoal, $context, $config),
                default => throw new RuntimeException('AI concierge is misconfigured.'),
            };

            if ($text === '') {
                throw new RuntimeException('AI concierge returned an empty response.');
            }

            return $text;
        } catch (Throwable $exception) {
            if ($exception instanceof RuntimeException) {
                throw $exception;
            }

            Log::error('Unexpected AI concierge error.', [
                'exception' => $exception->getMessage(),
            ]);

            throw new RuntimeException('AI concierge is temporarily unavailable.');
        }
    }

    protected function generateWithGemini(string $goal, array $context, array $config): string
    {
        $apiKey = (string) config('services.gemini.api_key', '');

        if ($apiKey === '') {
            Log::error('AI concierge is misconfigured: missing Gemini API key.');
            throw new RuntimeException('AI concierge is temporarily unavailable.');
        }

        $endpoint = rtrim((string) $config['endpoint'], '/').'/'.$config['model'].':generateContent';
        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => (string) $config['system_prompt']],
                ],
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $this->buildUserPrompt($goal, $context)],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => (float) $config['temperature'],
                'topP' => (float) $config['top_p'],
                'maxOutputTokens' => (int) $config['max_output_tokens'],
            ],
        ];

        $response = $this->httpClient($config['timeout_seconds'], $config['retries'])
            ->withQueryParameters(['key' => $apiKey])
            ->post($endpoint, $payload);

        if ($response->failed()) {
            Log::warning('Gemini request failed.', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new RuntimeException('AI concierge is temporarily unavailable.');
        }

        return $this->extractGeminiText($response->json());
    }

    protected function generateWithOllama(string $goal, array $context, array $config): string
    {
        $ollama = (array) ($config['providers']['ollama'] ?? []);
        $baseUrl = rtrim((string) ($ollama['base_url'] ?? ''), '/');
        $model = (string) ($ollama['model'] ?? '');

        if ($baseUrl === '' || $model === '') {
            Log::error('AI concierge is misconfigured: missing Ollama base URL or model.');
            throw new RuntimeException('AI concierge is temporarily unavailable.');
        }

        $payload = [
            'model' => $model,
            'stream' => false,
            'messages' => [
                ['role' => 'system', 'content' => (string) $config['system_prompt']],
                ['role' => 'user', 'content' => $this->buildUserPrompt($goal, $context)],
            ],
            'options' => [
                'temperature' => (float) ($ollama['temperature'] ?? 0.4),
                'top_p' => (float) ($ollama['top_p'] ?? 0.9),
                'num_predict' => (int) ($ollama['num_predict'] ?? 260),
            ],
        ];

        $response = $this->httpClient(
            (int) ($ollama['timeout_seconds'] ?? 45),
            (int) ($ollama['retries'] ?? 1)
        )->post($baseUrl.'/api/chat', $payload);

        if ($response->failed()) {
            Log::warning('Ollama request failed.', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new RuntimeException('AI concierge is temporarily unavailable.');
        }

        return $this->extractOllamaText($response->json());
    }

    protected function sanitizeGoal(string $goal): string
    {
        $maxChars = (int) config('ai.concierge.max_input_chars', 600);
        $goal = strip_tags($goal);
        $goal = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $goal) ?? '';
        $goal = preg_replace('/\s+/u', ' ', $goal) ?? '';
        $goal = trim($goal);

        if ($goal === '') {
            return '';
        }

        if (mb_strlen($goal) > $maxChars) {
            return mb_substr($goal, 0, $maxChars);
        }

        return $goal;
    }

    protected function httpClient(int $timeoutSeconds, int $retries): PendingRequest
    {
        return Http::acceptJson()
            ->asJson()
            ->timeout($timeoutSeconds)
            ->retry($retries, 250, throw: false);
    }

    protected function extractGeminiText(?array $payload): string
    {
        if (! is_array($payload)) {
            return '';
        }

        $parts = data_get($payload, 'candidates.0.content.parts', []);

        if (! is_array($parts)) {
            return '';
        }

        $text = collect($parts)
            ->pluck('text')
            ->filter(static fn ($value) => is_string($value) && trim($value) !== '')
            ->implode("\n");

        return trim($text);
    }

    protected function extractOllamaText(?array $payload): string
    {
        if (! is_array($payload)) {
            return '';
        }

        $text = data_get($payload, 'message.content');

        return is_string($text) ? trim($text) : '';
    }

    protected function buildUserPrompt(string $goal, array $context = []): string
    {
        if ($context === []) {
            return "Member goal: {$goal}";
        }

        $contextLines = collect($context)
            ->filter(static fn ($value, $key) => is_string($key) && (is_scalar($value) || is_array($value)))
            ->map(function ($value, $key) {
                if (is_array($value)) {
                    $encoded = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

                    return "{$key}: ".($encoded ?: '[]');
                }

                return "{$key}: ".(string) $value;
            })
            ->values()
            ->implode("\n");

        return "Member goal: {$goal}\n\nGym context:\n{$contextLines}";
    }
}
