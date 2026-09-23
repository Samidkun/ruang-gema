<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            // A2 — replay-safe: a duplicate webhook hits this unique key.
            $table->string('idempotency_key')->unique();
            $table->string('status')->default('initiated'); // initiated|settled|failed
            $table->unsignedInteger('amount_idr');
            $table->string('provider_ref')->nullable();
            $table->timestampTz('settled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
