<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;

class RoomController extends Controller
{
    /** AC-2 — room list with price (integer IDR). */
    public function index(): JsonResponse
    {
        $perPage = min((int) request('per_page', 20), 50);

        return response()->json([
            'data' => Room::query()->orderBy('price_idr')->paginate($perPage)->items(),
            'meta' => $this->meta(Room::count(), $perPage),
        ]);
    }

    /** AC-3 — availability for one room on one date (Asia/Jakarta). */
    public function availability(Room $room): JsonResponse
    {
        $date = request('date', now()->toDateString());
        abort_unless(preg_match('/^\d{4}-\d{2}-\d{2}$/', $date), 422, 'Tanggal tidak valid.');

        $tz = config('app.display_timezone', 'Asia/Jakarta');
        // Build the day window and the slots in the DISPLAY timezone (WIB), then
        // store/serve UTC. Previously setTime() was applied to a UTC-shifted
        // timestamp, so slots landed at 09.00 UTC (= 16.00 WIB) and no booking
        // was ever matched — the grid never showed a taken slot (AC-3).
        $dayStartWib = \Carbon\CarbonImmutable::parse($date, $tz)->startOfDay();
        $dayStart = $dayStartWib->utc();
        $dayEnd = $dayStartWib->addDay()->utc();

        $taken = $room->bookings()
            ->where('status', '!=', 'cancelled')
            ->where('start_at', '>=', $dayStart)
            ->where('start_at', '<', $dayEnd)
            ->pluck('start_at')
            ->map(fn ($t) => $t->utc()->format('H:i'))
            ->all();

        $slots = [];
        for ($h = 9; $h < 23; $h++) {
            $startWib = $dayStartWib->setTime($h, 0); // 09.00 WIB … 22.00 WIB
            $startUtc = $startWib->utc();
            $slots[] = [
                'start_at' => $startUtc->toIso8601String(),
                'end_at' => $startWib->addHour()->utc()->toIso8601String(),
                'available' => ! in_array($startUtc->format('H:i'), $taken, true),
                'price_idr' => $room->price_idr,
            ];
        }

        return response()->json([
            'data' => ['date' => $date, 'room_id' => $room->id, 'slots' => $slots],
            'meta' => null,
        ]);
    }

    private function meta(int $total, int $perPage): array
    {
        return ['page' => 1, 'per_page' => $perPage, 'total' => $total];
    }
}
