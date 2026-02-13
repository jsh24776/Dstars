<?php

namespace Database\Seeders;

use App\Models\MembershipPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MembershipPlanSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Day Pass',
                'duration' => 'day',
                'duration_count' => 1,
                'price' => 200,
                'status' => 'active',
                'features' => ['Full Gym Access', 'Locker Access', 'Coach Support', 'Member App Entry'],
            ],
            [
                'name' => '1 Month',
                'duration' => 'month',
                'duration_count' => 1,
                'price' => 1000,
                'status' => 'active',
                'features' => ['Unlimited Gym Access', 'Locker Access', 'Starter Assessment', 'Member App Entry'],
            ],
            [
                'name' => '2 Months',
                'duration' => 'month',
                'duration_count' => 2,
                'price' => 1780,
                'status' => 'active',
                'features' => ['Unlimited Gym Access', 'Locker Access', 'Group Classes', 'Member App Entry'],
            ],
            [
                'name' => '3 Months',
                'duration' => 'month',
                'duration_count' => 3,
                'price' => 2680,
                'status' => 'active',
                'features' => ['Unlimited Gym Access', 'Locker Access', 'Priority Slots', 'Member App Entry'],
            ],
        ];

        foreach ($plans as $plan) {
            $slug = Str::slug($plan['name']);

            MembershipPlan::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $plan['name'],
                    'duration' => $plan['duration'],
                    'duration_count' => $plan['duration_count'],
                    'slug' => $slug,
                    'price' => $plan['price'],
                    'status' => $plan['status'],
                    'billing_cycle' => $plan['duration'] === 'day' ? 'daily' : 'monthly',
                    'is_active' => $plan['status'] === 'active',
                    'features' => $plan['features'],
                ]
            );
        }

        $allowedSlugs = array_map(
            static fn (array $plan): string => Str::slug($plan['name']),
            $plans
        );

        MembershipPlan::query()
            ->whereNotIn('slug', $allowedSlugs)
            ->delete();
    }
}
