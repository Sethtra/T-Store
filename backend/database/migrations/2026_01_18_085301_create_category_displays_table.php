<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('category_displays', function (Blueprint $table) {
            $table->id();
            $table->enum('position', ['main', 'featured', 'small_1', 'small_2'])->unique();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('button_text')->default('View More');
            $table->string('link')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Seed default positions
        DB::table('category_displays')->insert([
            [
                'position' => 'main',
                'title' => 'All Product',
                'description' => 'Discover endless possibilities with our All Products category. Shop now for everything you need in one convenient place.',
                'button_text' => 'Browse All Products',
                'link' => '/products',
                'order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'position' => 'featured',
                'title' => 'Displays',
                'description' => 'Experience crystal-clear clarity and vibrant visuals with our Displays.',
                'button_text' => 'View More',
                'link' => '/products?category=electronics',
                'order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'position' => 'small_1',
                'title' => 'Headphones',
                'description' => 'Premium sound & style',
                'button_text' => 'View',
                'link' => '/products?category=accessories',
                'order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'position' => 'small_2',
                'title' => 'Phones',
                'description' => 'Advanced technology',
                'button_text' => 'View',
                'link' => '/products?category=clothing',
                'order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_displays');
    }
};
