<?php

namespace App\Http\Controllers;

use App\Models\CategoryDisplay;
use Illuminate\Support\Facades\Cache;

class CategoryDisplayController extends Controller
{
    /**
     * Get all active category displays for the frontend.
     */
    public function index()
    {
        $displays = Cache::remember('category_displays_index', 3600, function () {
            return CategoryDisplay::with('category')
                ->active()
                ->ordered()
                ->get();
        });

        return response()->json($displays);
    }
}
