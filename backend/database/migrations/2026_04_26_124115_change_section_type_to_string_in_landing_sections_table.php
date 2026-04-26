<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('landing_sections', function (Blueprint $table) {
            $table->string('section_type')->default('hero_main')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landing_sections', function (Blueprint $table) {
            $table->enum('section_type', ['hero_main', 'hero_featured', 'hero_small'])->default('hero_main')->change();
        });
    }
};
