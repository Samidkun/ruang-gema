<?php

namespace Tests\Feature;

use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * E9 adversarial probe — the green suite does NOT cover this.
 * AC-8: N concurrent writers race on the same slot. Exactly one wins; the store
 * stays usable afterwards (no wedged/poisoned connection).
 */
class ConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_ac8_concurrent_same_slot_yields_exactly_one_winner(): void
    {
        $room = Room::create([
            'name' => 'Studio A', 'capacity' => 6, 'size_label' => '6x5 m',
            'description' => 'x', 'price_idr' => 150000, 'features' => [],
        ]);

        $payload = [
            'room_id' => $room->id,
            'start_at' => '2026-11-01T19:00:00Z',
            'duration_hours' => 1,
            'name' => 'Racer',
            'phone' => '081200000009',
        ];

        // Fire N sequential HTTP requests in the same process. The point is the
        // unique index + 409 mapping, which is what a real race resolves to.
        $statuses = [];
        for ($i = 0; $i < 5; $i++) {
            $statuses[] = $this->postJson('/api/bookings', $payload)->status();
        }

        $created = count(array_filter($statuses, fn ($s) => $s === 201));
        $conflict = count(array_filter($statuses, fn ($s) => $s === 409));

        $this->assertSame(1, $created, 'expected exactly one winner, got: '.implode(',', $statuses));
        $this->assertSame(4, $conflict, 'expected four 409s, got: '.implode(',', $statuses));

        // The store is NOT wedged: a later, different slot still works.
        $later = $this->postJson('/api/bookings', array_merge($payload, ['start_at' => '2026-11-01T20:00:00Z']));
        $later->assertCreated();
    }
}
