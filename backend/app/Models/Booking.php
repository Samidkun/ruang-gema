<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Booking extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'booking_code', 'room_id', 'start_at', 'end_at', 'duration_hours',
        'total_idr', 'dp_idr', 'status', 'hold_expires_at',
        'customer_name', 'customer_phone', 'cancelled_at',
    ];

    protected $casts = [
        'start_at' => 'immutable_datetime',
        'end_at' => 'immutable_datetime',
        'hold_expires_at' => 'immutable_datetime',
        'cancelled_at' => 'immutable_datetime',
        'duration_hours' => 'integer',
        'total_idr' => 'integer',
        'dp_idr' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Booking $b) {
            $b->booking_code ??= (string) Str::ulid();
        });
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /** Public projection — never leaks another customer's PII (AC-6). */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'booking_code' => $this->booking_code,
            'room_id' => $this->room_id,
            'room_name' => $this->room?->name,
            'start_at' => $this->start_at?->toIso8601String(),
            'end_at' => $this->end_at?->toIso8601String(),
            'duration_hours' => $this->duration_hours,
            'total_idr' => $this->total_idr,
            'dp_idr' => $this->dp_idr,
            'status' => $this->status,
            'hold_expires_at' => $this->hold_expires_at?->toIso8601String(),
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
