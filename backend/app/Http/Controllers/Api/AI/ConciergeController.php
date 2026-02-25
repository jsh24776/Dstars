<?php

namespace App\Http\Controllers\Api\AI;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\AI\ConciergeRequest;
use App\Services\AIConciergeContextService;
use App\Services\AIConciergeService;
use RuntimeException;
use Illuminate\Http\JsonResponse;

class ConciergeController extends ApiController
{
    public function __construct(
        protected AIConciergeService $aiConciergeService,
        protected AIConciergeContextService $contextService
    ) {
    }

    public function __invoke(ConciergeRequest $request): JsonResponse
    {
        try {
            $context = $this->contextService->buildContext();

            $recommendation = $this->aiConciergeService->generateRecommendation(
                $request->string('goal')->toString(),
                $context
            );

            return $this->success([
                'recommendation' => $recommendation,
            ], 'Recommendation generated.');
        } catch (RuntimeException) {
            return $this->error(
                'The AI concierge is temporarily unavailable. Please try again shortly.',
                503
            );
        }
    }
}
