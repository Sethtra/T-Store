<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Handles image uploads to Supabase Storage.
 * Uses the Supabase REST API directly for maximum compatibility.
 */
class SupabaseStorageService
{
    private string $url;
    private string $key;
    private string $bucket;

    public function __construct()
    {
        $this->url = rtrim(config('services.supabase.url'), '/');
        $this->key = config('services.supabase.key');
        $this->bucket = config('services.supabase.storage_bucket', 'images');
    }

    /**
     * Upload a file to Supabase Storage.
     *
     * @param UploadedFile $file The uploaded file
     * @param string $folder The folder inside the bucket (e.g., 'products', 'banners')
     * @return string The full public URL of the uploaded file
     */
    public function upload(UploadedFile $file, string $folder = ''): string
    {
        $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
        $path = $folder ? "{$folder}/{$filename}" : $filename;

        // Upload via Supabase Storage REST API
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->key,
            'apikey' => $this->key,
            'Content-Type' => $file->getMimeType(),
        ])->withBody(
            file_get_contents($file->getRealPath()),
            $file->getMimeType()
        )->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

        if ($response->failed()) {
            // If file exists, try upsert
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->key,
                'apikey' => $this->key,
                'Content-Type' => $file->getMimeType(),
                'x-upsert' => 'true',
            ])->withBody(
                file_get_contents($file->getRealPath()),
                $file->getMimeType()
            )->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

            if ($response->failed()) {
                throw new \RuntimeException(
                    'Supabase Storage upload failed: ' . $response->body()
                );
            }
        }

        // Return the public URL
        return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
    }

    /**
     * Delete a file from Supabase Storage by its full public URL.
     *
     * @param string $publicUrl The full public URL of the file
     * @return bool
     */
    public function delete(string $publicUrl): bool
    {
        // Extract the path from the public URL
        $prefix = "{$this->url}/storage/v1/object/public/{$this->bucket}/";
        if (!str_starts_with($publicUrl, $prefix)) {
            return false; // Not a Supabase URL, skip
        }

        $path = substr($publicUrl, strlen($prefix));

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->key,
            'apikey' => $this->key,
        ])->delete("{$this->url}/storage/v1/object/{$this->bucket}", [
            'prefixes' => [$path],
        ]);

        return $response->successful();
    }
}
