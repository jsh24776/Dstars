<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'payment_reference',
        'invoice_id',
        'member_id',
        'amount_paid',
        'payment_method',
        'payment_status',
        'paid_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'paid_at' => 'datetime',
            'payment_status' => PaymentStatus::class,
        ];
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
