<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            if (! Schema::hasColumn('membership_plans', 'duration')) {
                $table->string('duration', 20)->default('month')->after('name');
            }

            if (! Schema::hasColumn('membership_plans', 'duration_count')) {
                $table->unsignedSmallInteger('duration_count')->default(1)->after('duration');
            }

            if (! Schema::hasColumn('membership_plans', 'status')) {
                $table->string('status', 20)->default('active')->after('price');
            }
        });

        $plans = DB::table('membership_plans')
            ->select('id', 'name', 'billing_cycle', 'is_active')
            ->get();

        foreach ($plans as $plan) {
            $name = strtolower((string) $plan->name);

            $duration = 'month';
            $durationCount = 1;

            if (str_contains($name, 'day')) {
                $duration = 'day';
                $durationCount = 1;
            } elseif (preg_match('/(\d+)/', $name, $matches) === 1) {
                $durationCount = max(1, (int) $matches[1]);
            }

            $status = isset($plan->is_active) && (bool) $plan->is_active ? 'active' : 'inactive';

            DB::table('membership_plans')
                ->where('id', $plan->id)
                ->update([
                    'duration' => $duration,
                    'duration_count' => $durationCount,
                    'status' => $status,
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            if (Schema::hasColumn('membership_plans', 'status')) {
                $table->dropColumn('status');
            }

            if (Schema::hasColumn('membership_plans', 'duration_count')) {
                $table->dropColumn('duration_count');
            }

            if (Schema::hasColumn('membership_plans', 'duration')) {
                $table->dropColumn('duration');
            }
        });
    }
};
