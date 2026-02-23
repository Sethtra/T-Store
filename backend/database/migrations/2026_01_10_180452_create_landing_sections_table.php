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
        Schema::create('landing_sections', function (Blueprint $table) {
            $table->id();
            $table->enum('section_type', ['hero_main', 'hero_featured', 'hero_small'])->default('hero_main');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable(); // Custom title override
            $table->text('description')->nullable(); // Custom description override
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_sections');
    }
};
