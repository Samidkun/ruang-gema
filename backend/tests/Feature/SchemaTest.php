<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * T1 — schema contract. RED before the migrations exist.
 * Traces to: AC-8 (slot uniqueness), AC-5 (payment idempotency), AC-4/AC-9 (status).
 */
class SchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_rooms_table_has_the_contract_columns(): void
    {
        $this->assertTrue(Schema::hasTable('rooms'), 'rooms table missing');
        foreach (['id','name','capacity','size_label','description','price_idr','features','created_at'] as $col) {
            $this->assertTrue(Schema::hasColumn('rooms', $col), "rooms.$col missing");
        }
    }

    public function test_bookings_table_has_the_contract_columns(): void
    {
        $this->assertTrue(Schema::hasTable('bookings'), 'bookings table missing');
        foreach (['id','booking_code','room_id','start_at','end_at','duration_hours',
                  'total_idr','dp_idr','status','hold_expires_at','customer_name',
                  'customer_phone','cancelled_at','created_at'] as $col) {
            $this->assertTrue(Schema::hasColumn('bookings', $col), "bookings.$col missing");
        }
    }

    public function test_payments_table_has_the_contract_columns(): void
    {
        $this->assertTrue(Schema::hasTable('payments'), 'payments table missing');
        foreach (['id','booking_id','idempotency_key','status','amount_idr',
                  'provider_ref','settled_at','created_at'] as $col) {
            $this->assertTrue(Schema::hasColumn('payments', $col), "payments.$col missing");
        }
    }

    /** AC-8 — the partial unique index is the load-bearing constraint. */
    public function test_partial_unique_index_blocks_double_booking_but_allows_recancel(): void
    {
        $roomId = DB::table('rooms')->insertGetId([
            'name' => 'Studio A', 'capacity' => 6, 'size_label' => '6x5 m',
            'description' => 'x', 'price_idr' => 150000, 'features' => json_encode([]),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $row = fn (string $status) => [
            'booking_code' => (string) \Illuminate\Support\Str::ulid(),
            'room_id' => $roomId, 'start_at' => '2026-10-01 10:00:00+00',
            'end_at' => '2026-10-01 11:00:00+00', 'duration_hours' => 1,
            'total_idr' => 150000, 'dp_idr' => 75000, 'status' => $status,
            'customer_name' => 'Bagas', 'customer_phone' => '081200000001',
            'created_at' => now(), 'updated_at' => now(),
        ];

        DB::table('bookings')->insert($row('pending'));

        // second active booking on the same (room, start) must fail.
        // Wrap in a nested transaction (savepoint) so the deliberate violation
        // rolls back to the savepoint and leaves the outer test transaction usable.
        $blocked = false;
        try {
            DB::transaction(function () use ($row) {
                DB::table('bookings')->insert($row('paid'));
            });
        } catch (\Illuminate\Database\QueryException $e) {
            $blocked = str_contains($e->getMessage(), 'bookings_room_start_unique')
                || $e->getCode() === '23505';
        }
        $this->assertTrue($blocked, 'duplicate active slot was NOT blocked (A1 regression)');

        // a cancelled booking must NOT block re-booking the slot
        DB::table('bookings')->where('status', 'pending')->update(['status' => 'cancelled']);
        DB::table('bookings')->insert($row('pending'));
        $this->assertSame(2, DB::table('bookings')->count(), 'cancelled slot still blocked re-booking');
    }

    /** AC-5 — idempotency key is unique. */
    public function test_payments_idempotency_key_is_unique(): void
    {
        $idx = DB::select("select indexname from pg_indexes where tablename = 'payments'");
        $names = array_map(fn ($r) => $r->indexname, $idx);
        $this->assertTrue(
            (bool) array_filter($names, fn ($n) => str_contains($n, 'idempotency_key')),
            'payments.idempotency_key has no unique index: ' . implode(',', $names)
        );
    }
}
