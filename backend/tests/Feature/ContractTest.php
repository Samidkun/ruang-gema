<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * T3 — interface contract. Written BEFORE the endpoints (RED first).
 * Traces to: AC-4, AC-5, AC-6, AC-7, AC-9, AC-11, AC-12.
 */
class ContractTest extends TestCase
{
    use RefreshDatabase;

    private function room(): Room
    {
        return Room::create([
            'name' => 'Studio A', 'capacity' => 6, 'size_label' => '6x5 m',
            'description' => 'Full backline', 'price_idr' => 150000, 'features' => ['AC'],
        ]);
    }

    private function payload(array $over = []): array
    {
        return array_merge([
            'room_id' => $this->room()->id,
            'start_at' => '2026-10-01T10:00:00Z',
            'duration_hours' => 2,
            'name' => 'Bagas Pratama',
            'phone' => '081234567890',
        ], $over);
    }

    // ---- envelope shape -------------------------------------------------

    public function test_success_envelope_shape_on_rooms(): void
    {
        $this->room();
        $r = $this->getJson('/api/rooms');
        $r->assertOk()->assertJsonStructure(['success', 'data' => [['id','name','capacity','size_label','description','price_idr','features']]]);
        $this->assertTrue($r->json('success'));
    }

    public function test_error_envelope_shape_on_validation_failure(): void
    {
        $r = $this->postJson('/api/bookings', []);
        $r->assertStatus(422)->assertJsonStructure(['success','error' => ['code','message']]);
        $this->assertFalse($r->json('success'));
        $this->assertSame('VALIDATION_FAILED', $r->json('error.code'));
    }

    // ---- AC-4: slot taken -------------------------------------------------

    public function test_ac4_second_booking_of_same_slot_returns_409_slot_taken(): void
    {
        $p = $this->payload();
        $this->postJson('/api/bookings', $p)->assertCreated();

        $r = $this->postJson('/api/bookings', $p);
        $r->assertStatus(409);
        $this->assertSame('SLOT_TAKEN', $r->json('error.code'));
    }

    /**
     * AC-4 (UI contract): the conflict message must name the hour in the DISPLAY
     * timezone (WIB), and `fields` must be a JSON object or absent — never an
     * empty array. A strict client (zod Record) rejects `"fields":[]`, so the
     * inline conflict alert would never render.
     */
    public function test_ac4_conflict_message_uses_wib_and_fields_is_never_empty_array(): void
    {
        // 19.00 WIB == 12.00 UTC.
        $p = array_merge($this->payload(), ['start_at' => '2026-10-01T19:00:00+07:00']);
        $this->postJson('/api/bookings', $p)->assertCreated();

        $r = $this->postJson('/api/bookings', $p);
        $r->assertStatus(409);

        $this->assertStringContainsString('19.00', $r->json('error.message'), 'message must name the WIB hour');
        $this->assertStringNotContainsString('12.00', $r->json('error.message'), 'message leaked the UTC hour');

        $raw = $r->json('error');
        $this->assertArrayNotHasKey('fields', $raw, 'empty `fields` must be omitted, not sent as []');
    }

    // ---- AC-12: server-derived price -------------------------------------

    public function test_ac12_forged_total_amount_is_ignored(): void
    {
        $p = $this->payload(['total_idr' => 1, 'dp_idr' => 1, 'amount_idr' => 1]);
        $r = $this->postJson('/api/bookings', $p)->assertCreated();
        // 150000 * 2 hours
        $this->assertSame(300000, $r->json('data.total_idr'));
        $this->assertSame(150000, $r->json('data.dp_idr'));
    }

    // ---- AC-6: public lookup by code, no PII leak -------------------------

    public function test_ac6_unknown_code_returns_404(): void
    {
        $this->getJson('/api/bookings/NOPE-123')->assertStatus(404)
            ->assertJsonPath('error.code', 'NOT_FOUND');
    }

    public function test_ac6_lookup_by_code_returns_that_booking(): void
    {
        $code = $this->postJson('/api/bookings', $this->payload())->json('data.booking_code');
        $r = $this->getJson("/api/bookings/{$code}")->assertOk();
        $this->assertSame($code, $r->json('data.booking_code'));
    }

    // ---- AC-5: webhook idempotency ---------------------------------------

    public function test_ac5_duplicate_webhook_settles_exactly_once(): void
    {
        $code = $this->postJson('/api/bookings', $this->payload())->json('data.booking_code');
        $pay = $this->postJson("/api/bookings/{$code}/pay", [])->assertOk();
        $paymentId = $pay->json('data.payment_id');

        $body = ['payment_id' => $paymentId, 'status' => 'settled', 'amount_idr' => 150000];
        $body['signature'] = $this->sign($body);

        $this->postJson('/api/payments/webhook', $body)->assertOk();
        $firstSettledAt = \App\Models\Payment::find($paymentId)->settled_at;
        sleep(1); // ensure a re-processing would produce a different timestamp
        $this->postJson('/api/payments/webhook', $body)->assertOk(); // replay

        $this->assertSame(1, \App\Models\Payment::where('status', 'settled')->count(),
            'webhook replay settled more than one payment');
        $this->assertSame('paid', Booking::where('booking_code', $code)->value('status'));
        // The load-bearing assertion: a replay must NOT re-process the payment.
        // Without the guard, settled_at moves and this fails (mutation check).
        $this->assertEquals($firstSettledAt, \App\Models\Payment::find($paymentId)->settled_at,
            'webhook replay re-processed an already-settled payment (idempotency guard missing)');
    }

    public function test_webhook_bad_signature_is_401(): void
    {
        $body = ['payment_id' => 1, 'status' => 'settled', 'amount_idr' => 150000, 'signature' => 'bad'];
        $this->postJson('/api/payments/webhook', $body)->assertStatus(401)
            ->assertJsonPath('error.code', 'BAD_SIGNATURE');
    }

    // ---- AC-9: cancel state machine --------------------------------------

    public function test_ac9_cancel_is_idempotent_guarded_by_state_machine(): void
    {
        $code = $this->postJson('/api/bookings', $this->payload())->json('data.booking_code');
        $this->postJson("/api/bookings/{$code}/cancel")->assertOk();
        $r = $this->postJson("/api/bookings/{$code}/cancel");
        $r->assertStatus(409)->assertJsonPath('error.code', 'ILLEGAL_TRANSITION');
    }

    // ---- AC-7: admin auth -------------------------------------------------

    public function test_ac7_admin_routes_require_auth_and_leak_no_data(): void
    {
        $r = $this->getJson('/api/admin/bookings');
        $this->assertContains($r->status(), [401, 403]);
        $r->assertJsonStructure(['success','error' => ['code','message']]);
        $this->assertNull($r->json('data'), 'admin route leaked data to an unauthenticated caller');
    }

    /**
     * AC-7 regression: a browser navigation does NOT send `Accept: application/json`.
     * Laravel's default auth middleware then tries to redirect to route('login'),
     * which does not exist in an API-only backend → RouteNotFoundException → 500.
     * The guard must return 401/403 JSON regardless of the Accept header.
     */
    public function test_ac7_admin_returns_json_not_500_without_accept_header(): void
    {
        $r = $this->get('/api/admin/bookings'); // no Accept: application/json

        $this->assertContains($r->status(), [401, 403], "got {$r->status()} — expected 401/403");
        $this->assertSame(false, $r->json('success'));
        $this->assertNull($r->json('data'));
    }

    // ---- AC-11: pagination ------------------------------------------------

    public function test_ac11_admin_list_is_paginated_with_capped_per_page(): void
    {
        $room = $this->room();
        $admin = \App\Models\User::factory()->create();
        for ($i = 0; $i < 60; $i++) {
            Booking::create([
                'room_id' => $room->id,
                'start_at' => now()->addDays($i + 1)->setTime(9, 0),
                'end_at' => now()->addDays($i + 1)->setTime(10, 0),
                'duration_hours' => 1, 'total_idr' => 150000, 'dp_idr' => 75000,
                'status' => 'paid', 'customer_name' => "Cust $i", 'customer_phone' => '0812'.str_pad($i, 8, '0'),
            ]);
        }
        $r = $this->actingAs($admin)->getJson('/api/admin/bookings?per_page=500')->assertOk();
        $this->assertLessThanOrEqual(50, $r->json('meta.per_page'), 'per_page cap not enforced');
        $this->assertLessThan(60, count($r->json('data')), 'whole table returned');
    }

    private function sign(array $body): string
    {
        unset($body['signature']);
        ksort($body);
        return hash_hmac('sha256', json_encode($body), config('services.mock_gateway.secret'));
    }
}
