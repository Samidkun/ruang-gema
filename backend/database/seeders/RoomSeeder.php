<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

/** Seeds the 4 rehearsal rooms exactly as the approved mockups show them. */
class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'name' => 'Studio A',
                'capacity' => 8,
                'size_label' => '6 × 5 METER',
                'description' => 'Full backline, drum premium, 2 gitar amp tabung, bass rig, 3 vocal mic, AC dingin.',
                'price_idr' => 150000,
                'features' => ['Full backline', 'AC 2 PK', 'Rockwool 80kg/m³'],
            ],
            [
                'name' => 'Studio B',
                'capacity' => 5,
                'size_label' => '5 × 4 METER',
                'description' => 'Drum set solid + 2 amplifier gitar & bass, 2 mic vokal, cocok untuk latihan rutin band 4–5 personil.',
                'price_idr' => 120000,
                'features' => ['Drum & bass rig', 'AC 1.5 PK', 'Rockwool 60kg/m³'],
            ],
            [
                'name' => 'Studio C',
                'capacity' => 3,
                'size_label' => '4 × 3 METER',
                'description' => 'Akustik intim, keyboard stereo, amplifier latihan, pas buat format duet atau jamming santai.',
                'price_idr' => 90000,
                'features' => ['Akustik & keyboard', 'AC 1 PK', 'Panel kayu'],
            ],
            [
                'name' => 'Studio D',
                'capacity' => 10,
                'size_label' => '7 × 6 METER',
                'description' => 'Recording-ready dengan ruang kontrol terpisah, live tracking multitrack, dan backline panggung besar.',
                'price_idr' => 250000,
                'features' => ['Recording-ready', 'AC 2 PK', 'Floating floor'],
            ],
        ];

        foreach ($rooms as $room) {
            Room::updateOrCreate(['name' => $room['name']], $room);
        }
    }
}
