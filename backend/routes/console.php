<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Order;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cancel orders with pending payment older than 24 hours
Artisan::command('orders:cancel-expired', function () {
    $count = Order::where('payment_status', 'pending')
        ->where('created_at', '<', now()->subHours(24))
        ->update([
            'status' => 'cancelled',
            'payment_status' => 'cancelled',
        ]);

    $this->info("Cancelled {$count} expired orders.");
})->purpose('Cancel orders with pending payment older than 24 hours');

// Schedule the command to run every hour
Schedule::command('orders:cancel-expired')->hourly();
