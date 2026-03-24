<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $request = new \Illuminate\Http\Request();
    $request->merge([
        'search' => 'test',
        'category' => 'electronics',
        'min_price' => '10',
        'max_price' => '100'
    ]);

    $controller = new \App\Http\Controllers\ProductController();
    $response = $controller->index($request);
    echo "SUCCESS\n";
    if (method_exists($response, 'getContent')) {
        echo substr($response->getContent(), 0, 500);
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
