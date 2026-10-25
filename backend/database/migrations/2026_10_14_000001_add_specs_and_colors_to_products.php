<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phone specifications (grouped JSON) and per-colour photo sets.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('specs')->nullable()->after('attributes');
        });

        Schema::create('product_colors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->string('name_kh', 50)->nullable();
            $table->string('hex', 9)->nullable();
            // { front, rear, left, right, top, bottom } => image URL or null
            $table->json('images')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_colors');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('specs');
        });
    }
};
