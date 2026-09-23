<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $service) {}

    /** AC-4, AC-8, AC-12 */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $booking = $this->service->create($request->validated());
        $booking->load('room');

        return response()->json(['data' => $booking->toPublicArray(), 'meta' => null], 201);
    }

    /** AC-6 — public lookup by opaque code only (no numeric id → no IDOR). */
    public function show(string $code): JsonResponse
    {
        $booking = Booking::with('room')->where('booking_code', $code)->firstOrFail();

        return response()->json(['data' => $booking->toPublicArray(), 'meta' => null]);
    }

    /** AC-9 */
    public function cancel(string $code): JsonResponse
    {
        $booking = Booking::where('booking_code', $code)->firstOrFail();
        $booking = $this->service->cancel($booking);
        $booking->load('room');

        return response()->json(['data' => $booking->toPublicArray(), 'meta' => null]);
    }

    /** AC-5 — start a payment; no amount is accepted from the client. */
    public function pay(string $code): JsonResponse
    {
        $booking = Booking::where('booking_code', $code)->firstOrFail();
        $payment = $this->service->initiatePayment($booking);

        return response()->json([
            'data' => [
                'payment_id' => $payment->id,
                'redirect_url' => url("/mock-gateway/{$payment->id}"),
            ],
            'meta' => null,
        ]);
    }
}
