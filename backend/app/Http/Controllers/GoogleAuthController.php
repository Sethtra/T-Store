<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Handle the callback from Google.
     * Since this route doesn't have session middleware (API route + redirect from Google),
     * we use a one-time token stored in cache and let the frontend exchange it via a
     * normal SPA request that DOES go through Sanctum's stateful middleware.
     */
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

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

            // Store a one-time login token in cache (expires in 5 minutes)
            $token = Str::random(64);
            Cache::put('google_auth_token:' . $token, $user->id, now()->addMinutes(5));

            // Redirect to frontend with the token
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?google=pending&token=' . $token);
        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?google=error&message=' . urlencode($e->getMessage()));
        }
    }

    /**
     * Exchange the one-time token for a proper session login.
     * This endpoint is called by the frontend via a normal SPA request,
     * which goes through Sanctum's stateful middleware and has session support.
     */
    public function verify(Request $request)
    {
        $token = $request->input('token');

        if (!$token) {
            return response()->json(['message' => 'Token is required.'], 422);
        }

        $userId = Cache::pull('google_auth_token:' . $token); // pull = get + delete

        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        Auth::login($user, true);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'message' => 'Login successful',
        ]);
    }
}
