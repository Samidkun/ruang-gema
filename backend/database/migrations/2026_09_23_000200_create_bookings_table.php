<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->ulid('booking_code')->unique();      // public id (Ruling R2)
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('start_at');             // UTC (Constitution §1.4)
            $table->timestampTz('end_at');
            $table->unsignedSmallInteger('duration_hours');
            $table->unsignedInteger('total_idr');        // server-derived (AC-12)
            $table->unsignedInteger('dp_idr');           // 50%
            $table->string('status')->default('pending'); // pending|paid|cancelled
            $table->timestampTz('hold_expires_at')->nullable(); // TTL (Ruling R6)
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->timestampTz('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['room_id', 'start_at']);
            $table->index('status');
        });

        // A1 — the load-bearing constraint. A partial unique index so a cancelled
        // booking does not block re-booking the same slot.
        DB::statement("
            CREATE UNIQUE INDEX bookings_room_start_unique
            ON bookings (room_id, start_at)
            WHERE status <> 'cancelled'
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
