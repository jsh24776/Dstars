<?php

namespace App\Models;

use App\Enums\MemberStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Member extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'username',
        'email',
        'phone',
        'status',
        'membership_id',
        'membership_plan_id',
        'profile_image_path',
        'verification_code',
        'verification_expires_at',
        'download_token_hash',
        'download_token_expires_at',
        'virtual_card_path',
        'is_verified',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verification_expires_at' => 'datetime',
            'download_token_expires_at' => 'datetime',
            'is_verified' => 'boolean',
            'status' => MemberStatus::class,
        ];
    }

    public function membershipPlan()
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function latestInvoice()
    {
        return $this->hasOne(Invoice::class)->latestOfMany();
    }

    public function getProfileImageUrlAttribute(): ?string
    {
        if (! $this->profile_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->profile_image_path);
    }
}
