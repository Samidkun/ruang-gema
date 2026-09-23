<?php

use App\Http\Controllers\Api\AdminBookingController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;

// Public (guest checkout — no account needed)
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{room}/availability', [RoomController::class, 'availability']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/{code}', [BookingController::class, 'show']);
Route::post('/bookings/{code}/cancel', [BookingController::class, 'cancel']);
Route::post('/bookings/{code}/pay', [BookingController::class, 'pay']);
Route::post('/payments/webhook', PaymentWebhookController::class);

// Owner only — server-side auth gate (AC-7)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::get('/bookings', [AdminBookingController::class, 'index']);
    Route::post('/bookings/{booking}/cancel', [AdminBookingController::class, 'cancel']);
});
