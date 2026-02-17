<?php

namespace App\Models;

use App\Enums\AttendanceSource;
use App\Enums\AttendanceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance_records';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'member_id',
        'attendance_date',
        'check_in_time',
        'check_out_time',
        'status',
        'source',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'check_in_time' => 'datetime',
            'check_out_time' => 'datetime',
            'status' => AttendanceStatus::class,
            'source' => AttendanceSource::class,
        ];
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
