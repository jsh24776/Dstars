<?php

namespace App\Enums;

enum MemberStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
