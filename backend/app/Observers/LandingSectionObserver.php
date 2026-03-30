<?php

namespace App\Observers;

use App\Models\LandingSection;
use Illuminate\Support\Facades\Cache;

class LandingSectionObserver
{
    /**
     * Handle the LandingSection "saved" event.
     */
    public function saved(LandingSection $landingSection): void
    {
        Cache::forget('landing_sections_index');
    }

    /**
     * Handle the LandingSection "deleted" event.
     */
    public function deleted(LandingSection $landingSection): void
    {
        Cache::forget('landing_sections_index');
    }

    /**
     * Handle the LandingSection "restored" event.
     */
    public function restored(LandingSection $landingSection): void
    {
        Cache::forget('landing_sections_index');
    }
}
