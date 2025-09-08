<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::insert([
            ['category_name' => 'Tin tức y tế'],
            ['category_name' => 'Hướng dẫn khám chữa bệnh'],
            ['category_name' => 'Chia sẻ sức khỏe'],
            ['category_name' => 'Khuyến mãi & Ưu đãi'],
        ]);
    }
}
