<?php

namespace App\Traits;

/**
 * Trait for resolving storage URLs across the application.
 * Handles both absolute URLs (http/https) and local storage paths.
 */
trait ResolvesStorageUrls
{
    /**
     * Resolve a storage path to a full URL.
     * Returns the path unchanged if it's already an absolute URL,
     * or prepends the storage asset URL if it's a relative path.
     *
     * @param string|null $path
     * @return string|null
     */
    protected function resolveStorageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return str_starts_with($path, 'http')
            ? $path
            : asset('storage/' . $path);
    }
}
