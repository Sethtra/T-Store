<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CategoryDisplayController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\LandingSectionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminCategoryDisplayController;
use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\LandingSectionController as AdminLandingSectionController;
use App\Http\Controllers\Admin\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Banner Routes
Route::get('/banners/main', [BannerController::class, 'getMainBanners']);
Route::get('/banners/section', [BannerController::class, 'getSectionBanners']);

// Landing Section Routes (Public)
Route::get('/landing-sections', [LandingSectionController::class, 'index']);

// Category Display Routes (Public)
Route::get('/category-displays', [CategoryDisplayController::class, 'index']);

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Reset Routes
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Google OAuth Routes
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/auth/google/verify', [GoogleAuthController::class, 'verify']);

// Visitor Routes
Route::post('/visit', [\App\Http\Controllers\VisitController::class, 'store']);

// Protected Routes (Authenticated Users)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Orders (Customer)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);

        // Products Management
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

        // Categories Management
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::get('/categories/all', [AdminCategoryController::class, 'all']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        // Banners Management
        Route::get('/banners', [AdminBannerController::class, 'index']);
        Route::post('/banners', [AdminBannerController::class, 'store']);
        Route::put('/banners/{banner}', [AdminBannerController::class, 'update']);
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy']);
        Route::post('/banners/reorder', [AdminBannerController::class, 'reorder']);

        // Landing Sections Management
        Route::get('/landing-sections', [AdminLandingSectionController::class, 'index']);
        Route::post('/landing-sections', [AdminLandingSectionController::class, 'store']);
        Route::get('/landing-sections/{landingSection}', [AdminLandingSectionController::class, 'show']);
        Route::put('/landing-sections/{landingSection}', [AdminLandingSectionController::class, 'update']);
        Route::delete('/landing-sections/{landingSection}', [AdminLandingSectionController::class, 'destroy']);

        // Category Displays Management
        Route::get('/category-displays', [AdminCategoryDisplayController::class, 'index']);
        Route::get('/category-displays/{categoryDisplay}', [AdminCategoryDisplayController::class, 'show']);
        Route::put('/category-displays/{categoryDisplay}', [AdminCategoryDisplayController::class, 'update']);
        Route::post('/category-displays/{categoryDisplay}/image', [AdminCategoryDisplayController::class, 'uploadImage']);
        Route::delete('/category-displays/{categoryDisplay}/image', [AdminCategoryDisplayController::class, 'deleteImage']);

        // Orders Management
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    });
});
