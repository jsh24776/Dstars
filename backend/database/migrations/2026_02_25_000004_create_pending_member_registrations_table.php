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
        Schema::create('pending_member_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 120);
            $table->string('email', 190)->unique();
            $table->string('phone', 30);
            $table->foreignId('plan_id')->constrained('membership_plans')->cascadeOnDelete();
            $table->string('verification_code')->nullable();
            $table->timestamp('verification_expires_at')->nullable();
            $table->timestamp('resend_available_at')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_member_registrations');
    }
};

