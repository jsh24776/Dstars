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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_reference', 40)->unique();
            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->cascadeOnDelete();
            $table->foreignId('member_id')
                ->constrained('members')
                ->cascadeOnDelete();
            $table->decimal('amount_paid', 10, 2);
            $table->string('payment_method', 30);
            $table->string('payment_status', 20)->default('recorded');
            $table->timestamp('paid_at');
            $table->timestamps();

            $table->unique('invoice_id');
            $table->index(['member_id', 'payment_status']);
            $table->index('paid_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
