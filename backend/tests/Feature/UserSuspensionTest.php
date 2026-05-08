<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserSuspensionTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::create([
            'name' => 'Suspended User',
            'email' => 'suspended@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'status' => 'inactive',
        ]);

        $user->createToken('existing-token');

        $this->postJson('/api/login', [
            'email' => 'suspended@example.com',
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Your account has been suspended. Please contact support.');

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_inactive_user_existing_token_cannot_access_api(): void
    {
        $user = User::create([
            'name' => 'Suspended Token User',
            'email' => 'suspended-token@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'status' => 'inactive',
        ]);

        $token = $user->createToken('existing-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user')
            ->assertForbidden()
            ->assertJsonPath('message', 'Your account has been suspended. Please contact support.');

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_admin_suspending_user_revokes_existing_tokens(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $user = User::create([
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'status' => 'active',
        ]);

        $user->createToken('existing-token');

        Sanctum::actingAs($admin);

        $this->putJson('/api/admin/users/' . $user->id, [
            'status' => 'inactive',
        ])
            ->assertOk()
            ->assertJsonPath('user.status', 'inactive');

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_admin_cannot_suspend_their_own_account(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'self-admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'status' => 'active',
        ]);

        Sanctum::actingAs($admin);

        $this->putJson('/api/admin/users/' . $admin->id, [
            'status' => 'inactive',
        ])
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot suspend your own account.');
    }
}
