<?php

use App\Exceptions\ApiException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API-only backend: there is no web `login` route, so the framework's
        // default guest redirect (`route('login')`) throws RouteNotFoundException
        // inside the auth middleware → 500 for any unauthenticated request that
        // does not send `Accept: application/json` (e.g. a browser navigation).
        // Return null so the exception carries no redirect target and the
        // exception handler can render a clean 401 JSON (AC-7).
        $middleware->redirectGuestsTo(fn () => null);

        $middleware->api(prepend: [
            \App\Http\Middleware\Envelope::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API is JSON-only: never redirect to a named `login` route (there is
        // none — this is an API backend). Without this, an unauthenticated
        // request that lacks `Accept: application/json` triggers a redirect to
        // route('login') → RouteNotFoundException → 500 instead of 401 (AC-7).
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Uniform error envelope for API routes (P2.5 §2).
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            [$status, $code, $message, $fields] = match (true) {
                $e instanceof ApiException => [$e->status, $e->errorCode, $e->getMessage(), $e->fields],
                $e instanceof ValidationException => [422, 'VALIDATION_FAILED', $e->getMessage(), $e->errors()],
                $e instanceof ModelNotFoundException => [404, 'NOT_FOUND', 'Data tidak ditemukan.', []],
                $e instanceof AuthenticationException => [401, 'UNAUTHENTICATED', 'Silakan masuk terlebih dahulu.', []],
                $e instanceof AuthorizationException => [403, 'FORBIDDEN', 'Kamu tidak punya akses ke sini.', []],
                $e instanceof HttpException => [$e->getStatusCode(), match ($e->getStatusCode()) {
                    401 => 'UNAUTHENTICATED', 403 => 'FORBIDDEN', 404 => 'NOT_FOUND', 429 => 'RATE_LIMITED',
                    default => 'ERROR',
                }, $e->getMessage() ?: 'Terjadi kesalahan.', []],
                default => [500, 'ERROR', 'Terjadi kesalahan pada server.', []],
            };

            $error = ['code' => $code, 'message' => $message];
            // Contract: `fields` is an optional Record<string,string[]>. Omit it
            // when empty — an empty JSON array breaks strict clients (AC-4).
            if (is_array($fields) && $fields !== []) {
                $error['fields'] = $fields;
            }

            return response()->json([
                'success' => false,
                'error' => $error,
            ], $status);
        });
    })->create();
