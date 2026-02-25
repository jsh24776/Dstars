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
            $table->string('username', 60)->nullable()->unique()->after('full_name');
            $table->string('profile_image_path')->nullable()->after('membership_id');
            $table->foreignId('membership_plan_id')
                ->nullable()
                ->constrained('membership_plans')
                ->nullOnDelete()
                ->after('profile_image_path');
            $table->string('status', 20)->default('inactive')->after('is_verified');
            $table->softDeletes();

            $table->index(['full_name', 'email', 'username'], 'members_search_index');
            $table->index('status');
            $table->index('membership_plan_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex('members_search_index');
            $table->dropIndex(['status']);
            $table->dropIndex(['membership_plan_id']);
            $table->dropIndex(['created_at']);

            $table->dropForeign(['membership_plan_id']);
            $table->dropColumn([
                'username',
                'profile_image_path',
                'membership_plan_id',
                'status',
            ]);

            $table->dropSoftDeletes();
        });
    }
};
