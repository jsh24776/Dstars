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
        // Add authentication fields to members table
        Schema::table('members', function (Blueprint $table) {
            if (! Schema::hasColumn('members', 'password')) {
                $table->string('password')->after('email');
            }

            if (! Schema::hasColumn('members', 'role')) {
                $table->string('role', 30)->default('member')->after('password');
            }

            if (! Schema::hasColumn('members', 'is_active')) {
                $table->boolean('is_active')->default(false)->after('role');
            }

            if (! Schema::hasColumn('members', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('is_active');
            }

            if (! Schema::hasColumn('members', 'remember_token')) {
                $table->rememberToken()->after('email_verified_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'password')) {
                $table->dropColumn('password');
            }

            if (Schema::hasColumn('members', 'role')) {
                $table->dropColumn('role');
            }

            if (Schema::hasColumn('members', 'is_active')) {
                $table->dropColumn('is_active');
            }

            if (Schema::hasColumn('members', 'email_verified_at')) {
                $table->dropColumn('email_verified_at');
            }

            if (Schema::hasColumn('members', 'remember_token')) {
                $table->dropColumn('remember_token');
            }
        });
    }
};
