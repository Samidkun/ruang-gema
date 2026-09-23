<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Every route here is behind auth + role (AC-7). */
class AdminBookingController extends Controller
{
    public function __construct(private readonly BookingService $service) {}

    /** AC-7, AC-11 — paginated, capped per_page. */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 20), 50);

        $q = Booking::with('room')->orderByDesc('start_at');
        if ($d = $request->query('date')) {
            $q->whereDate('start_at', $d);
        }
        if ($room = $request->query('room_id')) {
            $q->where('room_id', $room);
        }

        $page = $q->paginate($perPage);

        return response()->json([
            'data' => collect($page->items())->map(fn (Booking $b) => $b->toPublicArray())->all(),
            'meta' => ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total()],
        ]);
    }

    /** AC-9 */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:200']]);
        $booking = $this->service->cancel($booking);
        $booking->load('room');

        return response()->json(['data' => $booking->toPublicArray(), 'meta' => null]);
    }
}
