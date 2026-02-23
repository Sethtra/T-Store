<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class SubcategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Electronics' => ['Phones', 'Computers', 'Tablets', 'Audio', 'Cameras'],
            'Clothing' => ['T-Shirts', 'Shirts', 'Pants', 'Dresses', 'Shoes'],
            'Accessories' => ['Bags', 'Watches', 'Jewelry', 'Sunglasses', 'Hats'],
            'Home & Living' => ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Lighting'],
        ];

        foreach ($categories as $parentName => $subcategories) {
            // Find or Create Parent
            $parent = Category::firstOrCreate(
                ['name' => $parentName],
                ['slug' => Str::slug($parentName)]
            );

            // Create Children
            foreach ($subcategories as $subName) {
                Category::firstOrCreate(
                    [
                        'name' => $subName,
                        'parent_id' => $parent->id
                    ],
                    ['slug' => Str::slug($subName)]
                );
            }
        }
    }
}
