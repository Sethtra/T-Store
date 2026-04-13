<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

        // Determine MIME type: prefer client-reported type for image formats
        // PHP's finfo/getMimeType() can fail to detect webp on servers with older libmagic
        $mimeType = $file->getMimeType();
        $clientMime = $file->getClientMimeType();
        if ($clientMime && str_starts_with($clientMime, 'image/') && ($mimeType === 'application/octet-stream' || !$mimeType)) {
            $mimeType = $clientMime;
        }

        // Upload via Supabase Storage REST API
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->key,
            'apikey' => $this->key,
            'Content-Type' => $mimeType,
        ])->withBody(
            file_get_contents($file->getRealPath()),
            $mimeType
        )->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

        if ($response->failed()) {
            // If file exists, try upsert
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->key,
                'apikey' => $this->key,
                'Content-Type' => $mimeType,
                'x-upsert' => 'true',
            ])->withBody(
                file_get_contents($file->getRealPath()),
                $mimeType
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
            Log::info("Supabase delete skipped — URL does not match bucket prefix", [
                'url' => $publicUrl,
                'expected_prefix' => $prefix,
            ]);
            return false; // Not a Supabase URL, skip
        }

        $path = substr($publicUrl, strlen($prefix));

        // Supabase Storage REST API: DELETE /storage/v1/object/{bucket}
        // with JSON body containing "prefixes" array of file paths
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->key,
            'apikey' => $this->key,
        ])->withBody(
            json_encode(['prefixes' => [$path]]),
            'application/json'
        )->delete("{$this->url}/storage/v1/object/{$this->bucket}");

        if ($response->failed()) {
            Log::warning("Supabase delete failed for path: {$path}", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $response->successful();
    }
}
