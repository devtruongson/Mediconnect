<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CitySeeder::class,
            MediUserSeeder::class,
            DoctorSeeder::class,
            PatientSeeder::class,
            CategorySeeder::class,
            AvailabilitySchedulingSeeder::class,
            AppointmentSeeder::class,
            ContentSeeder::class,
            ContactMessageSeeder::class,
            MedicalRecordSeeder::class,
        ]);
    }
}
