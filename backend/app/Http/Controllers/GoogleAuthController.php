<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
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
     * Creates the Sanctum token directly and passes it to the frontend
     * via the redirect URL. This eliminates the unreliable Cache-based
     * token exchange that was causing first-login failures.
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

            // Create Sanctum token directly (no Cache intermediary)
            $sanctumToken = $user->createToken('auth-token')->plainTextToken;

            // Redirect to frontend with the real token and user data
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $userData = base64_encode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]));

            return redirect($frontendUrl . '/login?google=success&token=' . $sanctumToken . '&user=' . $userData);
        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?google=error&message=' . urlencode($e->getMessage()));
        }
    }
}

