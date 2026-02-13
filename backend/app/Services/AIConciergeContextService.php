<?php

namespace App\Services;

use App\Models\MembershipPlan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class AIConciergeContextService
{
    /**
     * @return array<string, mixed>
     */
    public function buildContext(): array
    {
        return [
            'membership_plans' => $this->membershipPlans(),
            'trainers' => $this->trainers(),
            'class_schedule' => $this->classSchedule(),
            'promotions' => $this->promotions(),
            'data_completeness' => $this->dataCompleteness(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function membershipPlans(): array
    {
        try {
            return Cache::remember('ai_concierge_membership_plans', now()->addMinutes(5), function () {
                return MembershipPlan::query()
                    ->where('status', 'active')
                    ->orderBy('price')
                    ->get(['id', 'name', 'duration', 'duration_count', 'slug', 'price', 'description', 'features'])
                    ->map(static function (MembershipPlan $plan): array {
                        return [
                            'id' => $plan->id,
                            'name' => $plan->name,
                            'slug' => $plan->slug,
                            'price' => (string) $plan->price,
                            'duration' => $plan->duration,
                            'duration_count' => $plan->duration_count,
                            'description' => $plan->description,
                            'features' => $plan->features ?? [],
                        ];
                    })
                    ->all();
            });
        } catch (Throwable $exception) {
            Log::warning('Unable to load membership plans for AI concierge context.', [
                'exception' => $exception->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function trainers(): array
    {
        return array_values(array_filter(
            (array) config('concierge.trainers', []),
            static fn ($trainer) => is_array($trainer)
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function classSchedule(): array
    {
        return array_values(array_filter(
            (array) config('concierge.class_schedule', []),
            static fn ($slot) => is_array($slot)
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function promotions(): array
    {
        return array_values(array_filter(
            (array) config('concierge.promotions', []),
            static fn ($offer) => is_array($offer)
        ));
    }

    /**
     * @return array<string, bool>
     */
    protected function dataCompleteness(): array
    {
        $hasPlans = $this->membershipPlans() !== [];
        $hasTrainers = $this->trainers() !== [];
        $hasSchedule = $this->classSchedule() !== [];

        return [
            'has_membership_plans' => $hasPlans,
            'has_trainers' => $hasTrainers,
            'has_class_schedule' => $hasSchedule,
        ];
    }
}
