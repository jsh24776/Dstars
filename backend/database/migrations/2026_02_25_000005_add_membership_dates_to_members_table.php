<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->date('membership_start_date')->nullable()->after('membership_plan_id');
            $table->date('membership_end_date')->nullable()->after('membership_start_date');
            $table->index('membership_end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex(['membership_end_date']);
            $table->dropColumn(['membership_start_date', 'membership_end_date']);
        });
    }
};

