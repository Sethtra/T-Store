<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Optional "was" price. When set above `price`, the storefront shows
     * the discount tag, the struck-through price and the saving.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('original_price');
        });
    }
};
