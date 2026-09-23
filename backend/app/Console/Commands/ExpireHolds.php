<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;

/** AC-10 — expire unpaid holds so a prime slot is not stranded. */
class ExpireHolds extends Command
{
    protected $signature = 'bookings:expire-holds';
    protected $description = 'Batalkan booking yang hold-nya kedaluwarsa (belum dibayar).';

    public function handle(): int
    {
        $count = Booking::query()
            ->where('status', Booking::STATUS_PENDING)
            ->whereNotNull('hold_expires_at')
            ->where('hold_expires_at', '<', now())
            ->update([
                'status' => Booking::STATUS_CANCELLED,
                'cancelled_at' => now(),
            ]);

        $this->info("Holds expired: {$count}");

        return self::SUCCESS;
    }
}
