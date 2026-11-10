<?php

namespace App;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait UploadFileTrait
{
    /**
     * Allowed MIME types with their magic bytes (file signatures)
     */
    protected const ALLOWED_MIME_TYPES = [
        // Images
        'image/jpeg' => ['FF D8 FF'],
        'image/png' => ['89 50 4E 47 0D 0A 1A 0A'],
        'image/webp' => ['52 49 46 46', '57 45 42 50'], // RIFF....WEBP
        'image/gif' => ['47 49 46 38 37 61', '47 49 46 38 39 61'], // GIF87a, GIF89a

        // Videos
        'video/mp4' => ['00 00 00 18 66 74 79 70', '00 00 00 1C 66 74 79 70', '00 00 00 20 66 74 79 70'], // ftyp
        'video/webm' => ['1A 45 DF A3'], // EBML
        'video/quicktime' => ['00 00 00 14 66 74 79 70', '00 00 00 1C 66 74 79 70', '6D 6F 6F 76'], // ftyp or moov
    ];

    /**
     * Validate file by checking magic bytes (file signature)
     */
    protected function validateFileSignature(UploadedFile $file, array $allowedMimeTypes = []): bool
    {
        $mimeType = $file->getMimeType();

        // If specific mime types provided, check against those
        $checkTypes = $allowedMimeTypes ?: array_keys(self::ALLOWED_MIME_TYPES);

        // Get the magic bytes for allowed types
        $allowedSignatures = [];
        foreach ($checkTypes as $type) {
            if (isset(self::ALLOWED_MIME_TYPES[$type])) {
                $allowedSignatures = array_merge($allowedSignatures, self::ALLOWED_MIME_TYPES[$type]);
            }
        }

        if (empty($allowedSignatures)) {
            return false;
        }

        // Read first 12 bytes for signature detection
        $fileHandle = $file->openFile('rb');
        $header = $fileHandle->fread(32);

        // Convert to hex string
        $hexHeader = strtoupper(bin2hex($header));
        $hexHeaderSpaced = implode(' ', str_split($hexHeader, 2));

        // Check if header matches any allowed signature
        foreach ($allowedSignatures as $signature) {
            $sigHex = str_replace(' ', '', $signature);
            if (str_starts_with($hexHeader, $sigHex) || str_starts_with($hexHeaderSpaced, $signature)) {
                return true;
            }
        }

        return false;
    }

    public function uploadFile(?UploadedFile $file, string $directory, string $oldFile = null, string $disk = 'public', array $allowedMimeTypes = [])
    {
        if (!$file instanceof UploadedFile) {
            return $oldFile;
        }

        if ($oldFile && Storage::disk($disk)->exists($oldFile)) {
            Storage::disk($disk)->delete($oldFile);
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        return $file->storeAs($directory, $filename, $disk);
    }
}
