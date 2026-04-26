<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('landing_sections', function (Blueprint $table) {
            $table->string('title_color_dark', 20)->nullable()->after('description_color');
            $table->string('description_color_dark', 20)->nullable()->after('title_color_dark');
        });
    }

    public function down(): void
    {
        Schema::table('landing_sections', function (Blueprint $table) {
            $table->dropColumn(['title_color_dark', 'description_color_dark']);
        });
    }
};
