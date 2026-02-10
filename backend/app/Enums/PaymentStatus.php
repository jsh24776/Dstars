<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Recorded = 'recorded';
    case Confirmed = 'confirmed';

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
