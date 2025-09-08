<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        City::insert([
            ['city_name' => 'Hà Nội'],
            ['city_name' => 'Hồ Chí Minh'],
            ['city_name' => 'Đà Nẵng'],
            ['city_name' => 'Cần Thơ'],
        ]);
    }
}
