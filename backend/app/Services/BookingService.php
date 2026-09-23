<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * All booking business rules live here — not in controllers (P2.5 layer map).
 * Transactions begin in this service.
 */
class BookingService
{
    public const HOLD_MINUTES = 15;   // Ruling R6
    public const DP_RATIO = 0.5;

    /** AC-4, AC-8, AC-12 — create a held booking; price is server-derived. */
    public function create(array $data): Booking
    {
        $room = Room::findOrFail($data['room_id']);
        $start = CarbonImmutable::parse($data['start_at'])->utc();
        $hours = (int) $data['duration_hours'];
        $end = $start->addHours($hours);

        // AC-12: amount NEVER comes from the client.
        $total = $room->price_idr * $hours;
        $dp = (int) round($total * self::DP_RATIO);

        try {
            return DB::transaction(function () use ($room, $start, $end, $hours, $total, $dp, $data) {
                return Booking::create([
                    'booking_code' => (string) Str::ulid(),
                    'room_id' => $room->id,
                    'start_at' => $start,
                    'end_at' => $end,
                    'duration_hours' => $hours,
                    'total_idr' => $total,
                    'dp_idr' => $dp,
                    'status' => Booking::STATUS_PENDING,
                    'hold_expires_at' => now()->addMinutes(self::HOLD_MINUTES),
                    'customer_name' => $data['name'],
                    'customer_phone' => $data['phone'],
                ]);
            });
        } catch (QueryException $e) {
            // A1: the partial unique index is the source of truth.
            if ($this->isUniqueViolation($e)) {
                throw new ApiException('SLOT_TAKEN', "Slot {$start->format('H.i')} baru saja diambil. Pilih jam lain.", 409);
            }
            throw $e;
        }
    }

    /** AC-5 — idempotent settlement. A replay is a no-op. */
    public function settlePayment(int $paymentId, int $amountIdr): void
    {
        DB::transaction(function () use ($paymentId, $amountIdr) {
            $payment = Payment::lockForUpdate()->findOrFail($paymentId);

            if ($payment->status === Payment::STATUS_SETTLED) {
                return; // already settled — replay is a no-op (A2)
            }
            if ($payment->amount_idr !== $amountIdr) {
                throw new ApiException('VALIDATION_FAILED', 'Nominal pembayaran tidak cocok.', 422);
            }

            $payment->update(['status' => Payment::STATUS_SETTLED, 'settled_at' => now()]);
            $payment->booking->update(['status' => Booking::STATUS_PAID]);
        });
    }

    /** AC-9 — state machine. Illegal transitions are 409. */
    public function cancel(Booking $booking): Booking
    {
        if ($booking->status === Booking::STATUS_CANCELLED) {
            throw new ApiException('ILLEGAL_TRANSITION', 'Booking ini sudah dibatalkan.', 409);
        }

        DB::transaction(function () use ($booking) {
            $booking->update(['status' => Booking::STATUS_CANCELLED, 'cancelled_at' => now()]);
            if ($booking->payment && $booking->payment->status === Payment::STATUS_SETTLED) {
                // refund recorded (mock) — see Runbook
                $booking->payment->update(['status' => Payment::STATUS_FAILED]);
            }
        });

        return $booking->refresh();
    }

    /** AC-5 — initiate a payment; idempotency key makes retries safe. */
    public function initiatePayment(Booking $booking): Payment
    {
        return Payment::firstOrCreate(
            ['booking_id' => $booking->id, 'status' => Payment::STATUS_INITIATED],
            [
                'idempotency_key' => (string) Str::ulid(),
                'amount_idr' => $booking->dp_idr,
                'provider_ref' => 'MOCK-'.Str::upper(Str::random(8)),
            ]
        );
    }

    private function isUniqueViolation(QueryException $e): bool
    {
        return $e->getCode() === '23505'
            || str_contains($e->getMessage(), 'bookings_room_start_unique');
    }
}
