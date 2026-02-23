<?php

namespace App\Http\Controllers;

use App\Models\CategoryDisplay;

class CategoryDisplayController extends Controller
{
    /**
     * Get all active category displays for the frontend.
     */
    public function index()
    {
        $displays = CategoryDisplay::with('category')
            ->active()
            ->ordered()
            ->get();

        return response()->json($displays);
    }
}
