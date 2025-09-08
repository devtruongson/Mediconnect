<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedicalRecord;

class MedicalRecordSeeder extends Seeder
{
    public function run(): void
    {
        MedicalRecord::create([
            'appointment_id' => 1, 
            'diagnosis'      => 'Cảm cúm nhẹ',
            'notes'          => 'Nghỉ ngơi, uống nhiều nước',
            'date'           => now(),
        ]);
    }
}
