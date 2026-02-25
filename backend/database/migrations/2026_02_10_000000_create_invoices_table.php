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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 40)->nullable()->unique();
            $table->foreignId('member_id')
                ->constrained('members')
                ->cascadeOnDelete();
            $table->string('plan_name', 120);
            $table->decimal('plan_price', 10, 2);
            $table->decimal('registration_fee', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->string('status', 20)->default('pending');
            $table->timestamp('issued_at');
            $table->timestamps();

            $table->index(['member_id', 'status']);
            $table->index('issued_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
