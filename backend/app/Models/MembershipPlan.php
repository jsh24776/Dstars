<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipPlan extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'duration',
        'duration_count',
        'slug',
        'price',
        'status',
        'billing_cycle',
        'is_active',
        'description',
        'features',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'features' => 'array',
            'is_active' => 'boolean',
            'duration_count' => 'integer',
            'price' => 'decimal:2',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function members()
    {
        return $this->hasMany(Member::class);
    }
}
