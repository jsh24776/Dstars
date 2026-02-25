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
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->date('attendance_date');
            $table->dateTime('check_in_time')->nullable();
            $table->dateTime('check_out_time')->nullable();
            $table->string('status', 20)->default('present');
            $table->string('source', 30)->default('admin_manual');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'attendance_date'], 'attendance_member_date_unique');
            $table->index(['attendance_date', 'status'], 'attendance_date_status_idx');
            $table->index(['member_id', 'status', 'attendance_date'], 'attendance_member_status_date_idx');
            $table->index('check_in_time', 'attendance_check_in_time_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};

