<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'membership_id',
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
        ];
    }
}
