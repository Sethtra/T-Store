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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_name')->nullable()->after('payment_intent');
            $table->string('shipping_phone')->nullable()->after('shipping_name');
            $table->string('shipping_email')->nullable()->after('shipping_phone');
            $table->text('shipping_address')->nullable()->after('shipping_email');
            $table->string('shipping_city')->nullable()->after('shipping_address');
            $table->string('shipping_country')->nullable()->after('shipping_city');
            $table->string('shipping_postal_code')->nullable()->after('shipping_country');
            $table->text('notes')->nullable()->after('shipping_postal_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_name',
                'shipping_phone',
                'shipping_email',
                'shipping_address',
                'shipping_city',
                'shipping_country',
                'shipping_postal_code',
                'notes',
            ]);
        });
    }
};
