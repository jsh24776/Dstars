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
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('subtotal_amount', 10, 2)->default(0)->after('registration_fee');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('subtotal_amount');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('discount_amount');
            $table->string('payment_method', 30)->nullable()->after('status');
            $table->text('notes')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal_amount',
                'discount_amount',
                'tax_amount',
                'payment_method',
                'notes',
            ]);
        });
    }
};

