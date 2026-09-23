<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// AC-10 — expire unpaid holds every minute (Ruling R6: 15-minute TTL).
Schedule::command('bookings:expire-holds')->everyMinute();
