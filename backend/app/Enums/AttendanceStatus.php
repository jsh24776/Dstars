<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case Present = 'present';
    case Absent = 'absent';
    case Late = 'late';
    case Cancelled = 'cancelled';

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}

