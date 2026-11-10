<?php

$types = [
    // extension => [mimetypes, display_type, human label]
    'pdf' => ['application/pdf', 'pdf', 'PDF'],
    'zip' => ['application/zip', 'zip', 'ZIP'],
    'doc' => [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc',
        'Word document',
    ],
    'slide' => [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'slide',
        'Presentation',
    ],
    'sheet' => [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'sheet',
        'Spreadsheet',
    ],
    'txt' => ['text/plain', 'text', 'Text file'],
    'md' => ['text/markdown', 'text', 'Markdown'],
];

return [
    // Attachments share the non-public lesson video disk.
    'attachment_disk' => env('LESSON_ATTACHMENT_DISK', env('LESSON_VIDEO_DISK', 'private')),

    // Server-side hard limit per file in KB (product decision: 50MB).
    'attachment_max_size' => env('LESSON_ATTACHMENT_MAX_SIZE', 50 * 1024),

    // Per-lesson cap so one lesson cannot flood the disk.
    'attachment_max_count' => env('LESSON_ATTACHMENT_MAX_COUNT', 20),

    'attachment_types' => $types,

    'attachment_mimetypes' => collect($types)
        ->flatten()
        ->filter(fn ($item) => str_contains((string) $item, '/'))
        ->unique()
        ->values()
        ->all(),
];
