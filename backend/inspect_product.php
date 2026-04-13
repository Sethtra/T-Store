<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = App\Models\Product::orderBy('created_at', 'desc')->first();
if($p) {
    echo "ID: " . $p->id . "\n";
    echo "Title: " . $p->title . "\n";
    echo "Images (Accessor): " . json_encode($p->images, JSON_PRETTY_PRINT) . "\n";
    echo "Raw Images: " . $p->getRawOriginal('images') . "\n";
} else {
    echo "No products found.\n";
}
