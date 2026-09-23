<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Uniform error envelope (P2.5 §2) — success:true on data, success:false on error. */
class Envelope
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->is('api/*')) {
            return $response;
        }

        $data = json_decode($response->getContent(), true);
        if (! is_array($data) || array_key_exists('success', $data)) {
            return $response;
        }

        $status = $response->getStatusCode();
        $isError = $status >= 400;

        $envelope = $isError
            ? ['success' => false, 'error' => [
                'code' => $data['code'] ?? $this->defaultCode($status),
                'message' => $data['message'] ?? 'Terjadi kesalahan.',
                'fields' => $data['errors'] ?? [],
              ]]
            : ['success' => true, 'data' => $data['data'] ?? $data, 'meta' => $data['meta'] ?? null];

        if (! $isError && ! array_key_exists('meta', $envelope)) {
            $envelope['meta'] = null;
        }

        $response->setContent(json_encode($envelope));

        return $response;
    }

    private function defaultCode(int $status): string
    {
        return match ($status) {
            401 => 'UNAUTHENTICATED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            422 => 'VALIDATION_FAILED',
            429 => 'RATE_LIMITED',
            default => 'ERROR',
        };
    }
}
