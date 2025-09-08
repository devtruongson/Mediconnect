<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        Doctor::insert([
            // [
            //     'name'           => 'Dr. A',
            //     'qualification'  => 'MBBS, MD',
            //     'experience'     => 10,
            //     'phone'          => '0911000001',
            //     'email'          => 'dra@example.com',
            //     'specialization' => 'Cardiology',
            //     'gender'         => 'Male',
            //     'dob'            => '1980-01-01',
            //     'city_id'        => 1, 
            //     'user_id'        => 1, 
            //     'image'          => 'Doctor1.jpg',
            //     'description'    => 'anfkjfnkjnf'
            // ],
            // [
            //     'name'           => 'Dr. B',
            //     'qualification'  => 'MBBS',
            //     'experience'     => 5,
            //     'phone'          => '0911000002',
            //     'email'          => 'drb@example.com',
            //     'specialization' => 'Neurology',
            //     'gender'         => 'Female',
            //     'dob'            => '1985-03-21',
            //     'city_id'        => 1, 
            //     'user_id'        => 2, 
            //      'image'          => 'Doctor2.jpg',
            //     'description'    => 'anfkjfnkjnf'
            // ],
            
        ]);
    }
}
