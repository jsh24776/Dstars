<?php

namespace Database\Seeders;

use App\Models\MembershipPlan;
use Illuminate\Database\Seeder;

class MembershipPlanSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Essentials',
                'slug' => 'basic',
                'price' => 789,
                'billing_cycle' => 'monthly',
                'features' => ['24/7 Gym Access', 'Modern Equipment', 'Standard Lockers', 'App Access'],
            ],
            [
                'name' => 'Professional',
                'slug' => 'pro',
                'price' => 2149,
                'billing_cycle' => 'monthly',
                'features' => ['All Essentials', 'Group Classes', '1-on-1 Monthly Consultation', 'Sauna & Recovery Lounge'],
            ],
            [
                'name' => 'Elite',
                'slug' => 'elite',
                'price' => 3299,
                'billing_cycle' => 'monthly',
                'features' => ['All Professional', 'Unlimited PT Sessions', 'Nutritional Coaching', 'Priority Booking'],
            ],
        ];

        foreach ($plans as $plan) {
            MembershipPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
