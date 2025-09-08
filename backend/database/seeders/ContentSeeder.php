<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Content;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        Content::create([
            'category_id' => 1,       
            'created_by'  => 1,      
            'title'       => 'Hướng dẫn đặt lịch khám bệnh',
            'description' => 'Chi tiết cách bệnh nhân có thể đặt lịch thông qua hệ thống.',
            'image'       => 'guide.png',
            'name'        => 'abc',
        ]);
    }
}
