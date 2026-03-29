<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
    /**
     * Get active main banners for hero carousel
     */
    public function getMainBanners()
    {
        $banners = Cache::remember('banners_main', 3600, function () {
            return Banner::main()
                ->active()
                ->ordered()
                ->get();
        });

        return response()->json($banners);
    }

    /**
     * Get active section banners
     */
    public function getSectionBanners()
    {
        $banners = Cache::remember('banners_section', 3600, function () {
            return Banner::section()
                ->active()
                ->ordered()
                ->get();
        });

        return response()->json($banners);
    }
}
