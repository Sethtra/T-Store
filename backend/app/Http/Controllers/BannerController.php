<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    /**
     * Get active main banners for hero carousel
     */
    public function getMainBanners()
    {
        $banners = Banner::main()
            ->active()
            ->ordered()
            ->get();

        return response()->json($banners);
    }

    /**
     * Get active section banners
     */
    public function getSectionBanners()
    {
        $banners = Banner::section()
            ->active()
            ->ordered()
            ->get();

        return response()->json($banners);
    }
}
