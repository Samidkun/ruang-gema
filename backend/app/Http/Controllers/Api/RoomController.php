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
        $dayStart = \Carbon\CarbonImmutable::parse($date, $tz)->startOfDay()->utc();
        $dayEnd = $dayStart->addDay();

        $taken = $room->bookings()
            ->where('status', '!=', 'cancelled')
            ->where('start_at', '>=', $dayStart)
            ->where('start_at', '<', $dayEnd)
            ->pluck('start_at')
            ->map(fn ($t) => $t->utc()->format('H:i'))
            ->all();

        $slots = [];
        for ($h = 9; $h < 23; $h++) {
            $start = $dayStart->setTime($h, 0);
            $slots[] = [
                'start_at' => $start->toIso8601String(),
                'end_at' => $start->addHour()->toIso8601String(),
                'available' => ! in_array($start->format('H:i'), $taken, true),
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
