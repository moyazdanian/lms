"use client";

import React, { useRef, useState } from 'react';
import { ImageIcon, UploadIcon, VideoIcon, XIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { FormField } from '../../common/FormField';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE = 512 * 1024 * 1024;

export function MediaStep({ values, setField, errors }) {
  // Blob URLs stay alive for the whole wizard session on purpose: the parent
  // conditionally renders steps, so leaving this step unmounts the component
  // while `values.thumbnail` / `values.preview_video` still reference the
  // URLs (the review step shows them too). `replaceLocalUrl` revokes a URL
  // when a file is replaced or removed, and the browser discards the rest
  // when the page unloads.
  const localUrlsRef = useRef({ thumbnail: null, preview_video: null });
  const [localUrls, setLocalUrls] = useState({ thumbnail: null, preview_video: null });
  const [fileErrors, setFileErrors] = useState({});

  function replaceLocalUrl(kind, url) {
    const previous = localUrlsRef.current[kind];
    if (previous) URL.revokeObjectURL(previous);
    localUrlsRef.current[kind] = url;
    setLocalUrls((current) => ({ ...current, [kind]: url }));
  }

  function selectFile(kind, file) {
    if (!file) return;

    const isImage = kind === 'thumbnail';
    const validType = isImage
      ? file.type.startsWith('image/')
      : ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const message = isImage
      ? 'Choose a JPEG, PNG, WebP or GIF image smaller than 2 MB.'
      : 'Choose an MP4, WebM or QuickTime video smaller than 512 MB.';

    if (!validType || file.size > maxSize) {
      setFileErrors((current) => ({ ...current, [kind]: message }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    replaceLocalUrl(kind, previewUrl);
    setFileErrors((current) => ({ ...current, [kind]: '' }));

    if (kind === 'thumbnail') {
      setField('thumbnail_file', file);
      setField('thumbnail', previewUrl);
      setField('thumbnail_removed', false);
    } else {
      setField('preview_video_file', file);
      setField('preview_video', previewUrl);
      setField('preview_video_removed', false);
    }
  }

  function removeFile(kind) {
    replaceLocalUrl(kind, null);

    if (kind === 'thumbnail') {
      setField('thumbnail_file', null);
      setField('thumbnail', '');
      setField('thumbnail_removed', true);
    } else {
      setField('preview_video_file', null);
      setField('preview_video', '');
      setField('preview_video_removed', true);
    }
  }

  const thumbnailError = fileErrors.thumbnail || errors.thumbnail;
  const previewVideoError = fileErrors.preview_video || errors.preview_video;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <FormField
        id="thumbnail"
        label="Course thumbnail"
        required
        hint="16:9, at least 1280x720"
        error={thumbnailError}
      >
        <div className="space-y-3">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/50">
            {values.thumbnail ? (
              <>
                <img
                  src={values.thumbnail}
                  alt="Course thumbnail preview"
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="absolute right-2 top-2"
                  aria-label="Remove thumbnail"
                  onClick={() => removeFile('thumbnail')}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">No thumbnail uploaded yet</p>
              </div>
            )}
          </div>

          <label className="inline-flex">
            <input
              id="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => selectFile('thumbnail', event.target.files?.[0])}
            />
            <span className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium transition-colors duration-150 ease-out hover:bg-muted">
              <UploadIcon className="h-4 w-4" aria-hidden="true" />
              {values.thumbnail ? 'Replace image' : 'Upload image'}
            </span>
          </label>
        </div>
      </FormField>

      <FormField
        id="preview_video"
        label="Preview video"
        hint="Optional"
        error={previewVideoError}
      >
        <div className="space-y-3">
          <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/50">
            {values.preview_video ? (
              <video
                src={values.preview_video}
                controls
                // crossOrigin="use-credentials"
                className="h-full w-full bg-foreground/90"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <VideoIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">A short trailer helps conversion</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex">
              <input
                id="preview_video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="sr-only"
                onChange={(event) => selectFile('preview_video', event.target.files?.[0])}
              />
              <span className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium transition-colors duration-150 ease-out hover:bg-muted">
                <UploadIcon className="h-4 w-4" aria-hidden="true" />
                {values.preview_video ? 'Replace video' : 'Upload video'}
              </span>
            </label>
            {values.preview_video ? (
              <Button type="button" variant="ghost" onClick={() => removeFile('preview_video')}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </FormField>
    </div>
  );
}
