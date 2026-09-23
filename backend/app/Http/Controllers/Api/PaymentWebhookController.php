<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function __construct(private readonly BookingService $service) {}

    /** AC-5 — signature-verified, idempotent. */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->all();
        $signature = (string) ($data['signature'] ?? '');
        unset($data['signature']);
        ksort($data);

        $expected = hash_hmac('sha256', json_encode($data), config('services.mock_gateway.secret'));
        if (! hash_equals($expected, $signature)) {
            throw new \App\Exceptions\ApiException('BAD_SIGNATURE', 'Signature tidak valid.', 401);
        }

        $this->service->settlePayment((int) $data['payment_id'], (int) $data['amount_idr']);

        return response()->json(['data' => ['ok' => true], 'meta' => null]);
    }
}
