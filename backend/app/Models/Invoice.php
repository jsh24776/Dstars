<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'invoice_number',
        'member_id',
        'plan_name',
        'plan_price',
        'registration_fee',
        'total_amount',
        'status',
        'issued_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'plan_price' => 'decimal:2',
            'registration_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'issued_at' => 'datetime',
            'status' => InvoiceStatus::class,
        ];
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
