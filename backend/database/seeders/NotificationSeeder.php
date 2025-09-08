<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        Notification::create([
            'doctor_id'      => 1,
            'patient_id'     => 2,
            'appointment_id' => 1, 
            'type'           => 'booking',
            'message'        => 'New appointment booked by patient.',
            'is_read'        => false,
        ]);

        Notification::create([
            'doctor_id'      => 2,
            'patient_id'     => 1,
            'appointment_id' => 2,
            'type'           => 'cancel',
            'message'        => 'Appointment was cancelled by patient.',
            'is_read'        => false,
        ]);
    }
}
