<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ResolvesStorageUrls;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SiteSettingsController extends Controller
{
    use ResolvesStorageUrls;

    /**
     * Get all site settings.
     */
    public function index()
    {
        $settings = SiteSetting::all()->pluck('value', 'key');

        // Resolve URLs for the frontend
        $settings['site_logo_url'] = $this->resolveStorageUrl($settings->get('site_logo'));
        $settings['site_favicon_url'] = $this->resolveStorageUrl($settings->get('site_favicon'));

        return response()->json($settings);
    }

    /**
     * Upload a new site logo.
     */
    public function updateLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
        ]);

        // Delete old logo if it exists
        $oldLogo = SiteSetting::getValue('site_logo');
        if ($oldLogo && !str_starts_with($oldLogo, 'http')) {
            Storage::disk('public')->delete($oldLogo);
        }

        // Store the new logo
        $path = $request->file('logo')->store('branding', 'public');

        // Save to settings
        SiteSetting::setValue('site_logo', $path);

        // Clear caches
        Cache::forget('app_bootstrap');
        Cache::forget('site_settings');

        return response()->json([
            'message' => 'Logo updated successfully.',
            'logo_url' => asset('storage/' . $path),
        ]);
    }

    /**
     * Remove the site logo (revert to default text logo).
     */
    public function deleteLogo()
    {
        $oldLogo = SiteSetting::getValue('site_logo');
        if ($oldLogo && !str_starts_with($oldLogo, 'http')) {
            Storage::disk('public')->delete($oldLogo);
        }

        SiteSetting::setValue('site_logo', null);

        Cache::forget('app_bootstrap');
        Cache::forget('site_settings');

        return response()->json([
            'message' => 'Logo removed. Default logo will be used.',
        ]);
    }

    /**
     * Update site name.
     */
    public function updateName(Request $request)
    {
        $request->validate([
            'site_name' => 'required|string|max:50',
        ]);

        SiteSetting::setValue('site_name', $request->site_name);

        Cache::forget('app_bootstrap');
        Cache::forget('site_settings');

        return response()->json([
            'message' => 'Site name updated successfully.',
        ]);
    }

    /**
     * Upload a new site favicon.
     */
    public function updateFavicon(Request $request)
    {
        $request->validate([
            'favicon' => 'required|image|mimes:png,ico,svg,webp|max:512',
        ]);

        // Delete old favicon if it exists
        $oldFavicon = SiteSetting::getValue('site_favicon');
        if ($oldFavicon && !str_starts_with($oldFavicon, 'http')) {
            Storage::disk('public')->delete($oldFavicon);
        }

        // Store the new favicon
        $path = $request->file('favicon')->store('branding', 'public');

        SiteSetting::setValue('site_favicon', $path);

        Cache::forget('app_bootstrap');
        Cache::forget('site_settings');

        return response()->json([
            'message' => 'Favicon updated successfully.',
            'favicon_url' => asset('storage/' . $path),
        ]);
    }

    /**
     * Remove the site favicon (revert to default).
     */
    public function deleteFavicon()
    {
        $oldFavicon = SiteSetting::getValue('site_favicon');
        if ($oldFavicon && !str_starts_with($oldFavicon, 'http')) {
            Storage::disk('public')->delete($oldFavicon);
        }

        SiteSetting::setValue('site_favicon', null);

        Cache::forget('app_bootstrap');
        Cache::forget('site_settings');

        return response()->json([
            'message' => 'Favicon removed. Default will be used.',
        ]);
    }
}
