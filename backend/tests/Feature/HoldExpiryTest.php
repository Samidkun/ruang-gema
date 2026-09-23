<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** AC-10 — a hold that expires without payment is cancelled and the slot freed. */
class HoldExpiryTest extends TestCase
{
    use RefreshDatabase;

    private function room(): Room
    {
        return Room::create([
            'name' => 'Studio B', 'capacity' => 5, 'size_label' => '5x4 m',
            'description' => 'x', 'price_idr' => 120000, 'features' => [],
        ]);
    }

    public function test_ac10_expired_hold_is_cancelled_and_slot_freed(): void
    {
        $room = $this->room();
        $code = $this->postJson('/api/bookings', [
            'room_id' => $room->id, 'start_at' => '2026-12-01T18:00:00Z',
            'duration_hours' => 1, 'name' => 'Dewi', 'phone' => '081200000002',
        ])->json('data.booking_code');

        // The slot is held (taken) right now.
        $this->assertSame('pending', Booking::where('booking_code', $code)->value('status'));
        $this->postJson('/api/bookings', [
            'room_id' => $room->id, 'start_at' => '2026-12-01T18:00:00Z',
            'duration_hours' => 1, 'name' => 'Rian', 'phone' => '081200000003',
        ])->assertStatus(409);

        // Travel past the TTL and run the expiry job.
        $this->travel(20)->minutes();
        $this->artisan('bookings:expire-holds')->assertSuccessful();

        $this->assertSame('cancelled', Booking::where('booking_code', $code)->value('status'));

        // The slot is bookable again.
        $this->postJson('/api/bookings', [
            'room_id' => $room->id, 'start_at' => '2026-12-01T18:00:00Z',
            'duration_hours' => 1, 'name' => 'Rian', 'phone' => '081200000003',
        ])->assertCreated();
    }

    public function test_ac10_fresh_hold_survives_the_expiry_job(): void
    {
        $room = $this->room();
        $code = $this->postJson('/api/bookings', [
            'room_id' => $room->id, 'start_at' => '2026-12-03T18:00:00Z',
            'duration_hours' => 1, 'name' => 'Tono', 'phone' => '081200000005',
        ])->json('data.booking_code');

        // Run the job immediately — the 15-minute hold has NOT expired.
        $this->artisan('bookings:expire-holds')->assertSuccessful();

        $this->assertSame('pending', Booking::where('booking_code', $code)->value('status'),
            'a fresh hold was cancelled — the time condition is missing (mutation check)');
    }

    public function test_ac10_paid_booking_is_never_expired(): void
    {
        $room = $this->room();
        $code = $this->postJson('/api/bookings', [
            'room_id' => $room->id, 'start_at' => '2026-12-02T18:00:00Z',
            'duration_hours' => 1, 'name' => 'Sari', 'phone' => '081200000004',
        ])->json('data.booking_code');

        $paymentId = $this->postJson("/api/bookings/{$code}/pay")->json('data.payment_id');
        $body = ['payment_id' => $paymentId, 'status' => 'settled', 'amount_idr' => 60000];
        ksort($body);
        $body['signature'] = hash_hmac('sha256', json_encode($body), config('services.mock_gateway.secret'));
        $this->postJson('/api/payments/webhook', $body)->assertOk();

        $this->travel(30)->minutes();
        $this->artisan('bookings:expire-holds')->assertSuccessful();

        $this->assertSame('paid', Booking::where('booking_code', $code)->value('status'));
    }
}
