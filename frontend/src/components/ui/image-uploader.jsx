"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ImageUploader({ value, onChange, fallback }) {
  const [preview, setPreview] = useState(
    typeof value === "string" ? value : null,
  );

  const fileInputRef = useRef(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview */}
      <div>
        <Avatar className="h-22 w-22">
          {preview ? (
            <AvatarImage
              src={preview}
              alt={fallback || "Preview"}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="text-base">
            {fallback ? fallback.charAt(0) : "N"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Choose / Edit Button */}
      <div>
        <Button type="button" variant="secondary" onClick={openFilePicker}>
          {preview ? "Edit file" : "Choose file"}
        </Button>
        <div className="space-y-1 mt-2">
          <p className="text-xs text-muted-foreground">
            Square JPG or PNG, at least 200×200.
          </p>
        </div>
      </div>
    </div>
  );
}
