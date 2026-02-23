<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\Request;

class VisitController extends Controller
{
    /**
     * Record a new visit.
     */
    public function store(Request $request)
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        // Try to get user ID if authenticated via Sanctum
        $user = $request->user('sanctum');
        $userId = $user ? $user->id : null;

        // Check if this IP has already visited today
        // We define "today" based on server time
        $exists = Visit::where('ip_address', $ip)
            ->whereDate('created_at', Carbon::today())
            ->exists();

        if (!$exists) {
            Visit::create([
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'user_id' => $userId,
            ]);

            return response()->json(['message' => 'Visit recorded'], 201);
        }

        return response()->json(['message' => 'Visit already recorded for today'], 200);
    }
}
