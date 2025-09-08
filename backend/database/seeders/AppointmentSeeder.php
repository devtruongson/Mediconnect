<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        Appointment::create([
            'patient_id'      => 1,
            'availability_id' => 1,
            'status'          => 'pending',
        ]);
    
        Appointment::create([
            'patient_id'      => 2,
            'availability_id' => 3,
            'status'          => 'confirmed',
        ]);
    
        
        
    }
}
