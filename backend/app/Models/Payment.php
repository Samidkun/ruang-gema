<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const STATUS_INITIATED = 'initiated';
    public const STATUS_SETTLED = 'settled';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'booking_id', 'idempotency_key', 'status', 'amount_idr',
        'provider_ref', 'settled_at',
    ];

    protected $casts = [
        'amount_idr' => 'integer',
        'settled_at' => 'immutable_datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
