<?php

namespace App\Enums;

enum AttendanceSource: string
{
    case AdminManual = 'admin_manual';
    case QrScan = 'qr_scan';
    case VirtualId = 'virtual_id';
    case Kiosk = 'kiosk';

    public static function values(): array
    {
        return array_map(static fn (self $source) => $source->value, self::cases());
    }
}

