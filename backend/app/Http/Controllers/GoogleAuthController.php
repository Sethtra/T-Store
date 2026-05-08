<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirect()
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
        $driver = Socialite::driver('google');

        return $driver->stateless()->redirect();
    }

    /**
     * Handle the callback from Google.
     * Creates a short-lived one-time login code and passes only that code
     * through the redirect URL. The frontend exchanges the code for a token
     * with a POST request so Sanctum tokens never appear in browser URLs.
     */
    public function callback(Request $request)
    {
        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->stateless()->user();

            // Find existing user by google_id or email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // Update google_id if not set (user existed by email)
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->getId()]);
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(Str::random(24)),
                    'role' => 'customer',
                ]);
            }

            if (($user->status ?? 'active') !== 'active') {
                $user->tokens()->delete();

                $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
                return redirect($frontendUrl . '/login?google=error&message=' . urlencode('Your account has been suspended. Please contact support.'));
            }

            $loginCode = Str::random(64);
            Cache::put($this->loginCodeCacheKey($loginCode), [
                'user_id' => $user->id,
            ], now()->addMinutes(2));

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

            return redirect($frontendUrl . '/login?google=success&code=' . urlencode($loginCode));
        } catch (\Exception $e) {
            Log::warning('Google OAuth callback failed', ['error' => $e->getMessage()]);

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?google=error&message=' . urlencode('Google login failed. Please try again.'));
        }
    }

    /**
     * Exchange a one-time Google login code for a Sanctum token.
     */
    public function exchange(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:64',
        ]);

        $payload = Cache::pull($this->loginCodeCacheKey($request->code));

        if (!$payload || !isset($payload['user_id'])) {
            return response()->json([
                'message' => 'Google login expired. Please try again.',
            ], 422);
        }

        $user = User::find($payload['user_id']);

        if (!$user) {
            return response()->json([
                'message' => 'Google login expired. Please try again.',
            ], 422);
        }

        if (($user->status ?? 'active') !== 'active') {
            $user->tokens()->delete();

            return response()->json([
                'message' => 'Your account has been suspended. Please contact support.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at,
            ],
            'token' => $token,
        ]);
    }

    private function loginCodeCacheKey(string $code): string
    {
        return 'google_login_code:' . $code;
    }
}

