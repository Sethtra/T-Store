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
        // Add Khmer fields to products
        Schema::table('products', function (Blueprint $table) {
            $table->string('title_kh')->nullable()->after('title');
            $table->text('description_kh')->nullable()->after('description');
        });

        // Add Khmer fields to categories
        Schema::table('categories', function (Blueprint $table) {
            $table->string('name_kh')->nullable()->after('name');
        });

        // Add Khmer fields to landing_sections
        Schema::table('landing_sections', function (Blueprint $table) {
            $table->string('title_kh')->nullable()->after('title');
            $table->text('description_kh')->nullable()->after('description');
        });

        // Add Khmer fields to banners
        Schema::table('banners', function (Blueprint $table) {
            $table->string('title_kh')->nullable()->after('title');
            $table->string('subtitle_kh')->nullable()->after('subtitle');
            $table->text('description_kh')->nullable()->after('description');
            $table->string('button_text_kh')->nullable()->after('button_text');
        });

        // Add Khmer fields to category_displays
        Schema::table('category_displays', function (Blueprint $table) {
            $table->string('title_kh')->nullable()->after('title');
            $table->text('description_kh')->nullable()->after('description');
            $table->string('button_text_kh')->nullable()->after('button_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['title_kh', 'description_kh']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('name_kh');
        });

        Schema::table('landing_sections', function (Blueprint $table) {
            $table->dropColumn(['title_kh', 'description_kh']);
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['title_kh', 'subtitle_kh', 'description_kh', 'button_text_kh']);
        });

        Schema::table('category_displays', function (Blueprint $table) {
            $table->dropColumn(['title_kh', 'description_kh', 'button_text_kh']);
        });
    }
};
