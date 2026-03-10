<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'actor_type',
        'actor_id',
        'action',
        'entity_type',
        'entity_id',
        'details',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }
}

