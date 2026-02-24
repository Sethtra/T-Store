<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    use RefreshDatabase;

    private function makeCategory(string $name, ?Category $parent = null): Category
    {
        $slug = str($name)->slug()->toString();

        return Category::create([
            'name' => $name,
            'slug' => $slug . '-' . uniqid(),
            'parent_id' => $parent?->id,
        ]);
    }

    private function makeProduct(array $overrides = []): Product
    {
        $defaults = [
            'title' => 'Test Product ' . uniqid(),
            'slug' => 'test-product-' . uniqid(),
            'description' => 'Test description',
            'price' => 19.99,
            'stock' => 5,
            'category_id' => null,
            // Product model has a custom accessor but no cast for `images`; store JSON explicitly.
            'images' => json_encode(['https://example.com/a.jpg']),
            'attributes' => [],
        ];

        return Product::create(array_merge($defaults, $overrides));
    }

    public function test_public_products_index_returns_paginated_payload(): void
    {
        $category = $this->makeCategory('Shirts');
        $this->makeProduct(['category_id' => $category->id]);

        $res = $this->getJson('/api/products');

        $res->assertOk()
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonPath('meta.total', 1);
    }

    public function test_category_filter_includes_child_products(): void
    {
        $parent = $this->makeCategory('Men');
        $child = $this->makeCategory('Men - Shirts', $parent);

        $p1 = $this->makeProduct(['category_id' => $parent->id]);
        $p2 = $this->makeProduct(['category_id' => $child->id]);

        $res = $this->getJson('/api/products?category=' . $parent->slug);
        $res->assertOk();

        $slugs = collect($res->json('data'))->pluck('slug')->all();
        $this->assertContains($p1->slug, $slugs);
        $this->assertContains($p2->slug, $slugs);
    }

    public function test_featured_products_returns_in_stock_only_and_max_8(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->makeProduct(['stock' => 10]);
        }
        for ($i = 0; $i < 3; $i++) {
            $this->makeProduct(['stock' => 0]);
        }

        $res = $this->getJson('/api/products/featured');
        $res->assertOk();

        $items = $res->json();
        $this->assertCount(8, $items);
        foreach ($items as $item) {
            $this->assertGreaterThan(0, $item['stock']);
        }
    }

    public function test_public_product_show_by_slug(): void
    {
        $p = $this->makeProduct(['slug' => 'show-me']);

        $this->getJson('/api/products/' . $p->slug)
            ->assertOk()
            ->assertJsonPath('slug', 'show-me');
    }

    public function test_register_creates_customer_user(): void
    {
        $res = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $res->assertStatus(201)->assertJsonStructure(['message', 'user']);

        $this->assertDatabaseHas('users', [
            'email' => 'user@example.com',
            'role' => 'customer',
        ]);
    }

    public function test_login_works_for_valid_credentials(): void
    {
        User::create([
            'name' => 'Login User',
            'email' => 'login@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('message', 'Login successful');
    }

    public function test_authenticated_user_endpoint_returns_user(): void
    {
        $user = User::create([
            'name' => 'Auth User',
            'email' => 'auth@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'auth@example.com');
    }

    public function test_orders_can_be_created_and_decrement_stock(): void
    {
        $user = User::create([
            'name' => 'Buyer',
            'email' => 'buyer@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        $product = $this->makeProduct([
            'price' => 10.00,
            'stock' => 5,
        ]);

        Sanctum::actingAs($user);

        $res = $this->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'payment_method' => 'stripe',
            'delivery_method' => 'pickup',
        ]);

        $res->assertStatus(201)->assertJsonStructure(['message', 'order']);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'status' => 'pending']);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 3]);
    }

    public function test_admin_routes_forbidden_for_non_admin(): void
    {
        $user = User::create([
            'name' => 'Customer',
            'email' => 'customer@example.com',
            'password' => 'password123',
            'role' => 'customer',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/admin/products')
            ->assertStatus(403)
            ->assertJsonPath('message', 'Unauthorized. Admin access required.');
    }

    public function test_admin_routes_allowed_for_admin(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/products')->assertOk()
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }
}

