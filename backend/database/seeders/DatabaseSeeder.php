<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoomSeeder::class);

        // Admin owner for the /admin panel (AC-7).
        User::factory()->create([
            'name' => 'Owner Ruang Gema',
            'email' => 'owner@ruanggema.test',
        ]);
    }
}
