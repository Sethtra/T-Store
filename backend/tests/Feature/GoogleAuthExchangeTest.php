<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class GoogleAuthExchangeTest extends TestCase
{
    use RefreshDatabase;

    private function cacheLoginCode(User $user, string $code): void
    {
        Cache::put('google_login_code:' . $code, [
            'user_id' => $user->id,
        ], now()->addMinutes(2));
    }

    public function test_google_login_code_can_be_exchanged_once_for_token(): void
    {
        $user = User::create([
            'name' => 'Google User',
            'email' => 'google@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'status' => 'active',
        ]);

        $code = str_repeat('a', 64);
        $this->cacheLoginCode($user, $code);

        $response = $this->postJson('/api/auth/google/exchange', [
            'code' => $code,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Login successful')
            ->assertJsonPath('user.email', 'google@example.com')
            ->assertJsonStructure(['token']);

        $this->assertNotEmpty($response->json('token'));
        $this->assertSame(1, $user->tokens()->count());

        $this->postJson('/api/auth/google/exchange', [
            'code' => $code,
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Google login expired. Please try again.');
    }

    public function test_google_login_exchange_rejects_missing_or_expired_code(): void
    {
        $this->postJson('/api/auth/google/exchange', [
            'code' => str_repeat('b', 64),
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Google login expired. Please try again.');
    }

    public function test_google_login_exchange_blocks_suspended_user_and_revokes_tokens(): void
    {
        $user = User::create([
            'name' => 'Suspended Google User',
            'email' => 'suspended-google@example.com',
            'password' => 'password123',
            'role' => 'customer',
            'status' => 'inactive',
        ]);

        $user->createToken('existing-token');

        $code = str_repeat('c', 64);
        $this->cacheLoginCode($user, $code);

        $this->postJson('/api/auth/google/exchange', [
            'code' => $code,
        ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Your account has been suspended. Please contact support.');

        $this->assertSame(0, $user->tokens()->count());
    }
}
