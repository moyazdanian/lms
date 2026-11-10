"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export const CoursePreview = ({ course }) => {
  const [open, setOpen] = useState(false);
  const preview = course?.preview;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger - تصویر با دکمه پلی */}
      <DialogTrigger asChild>
        <div className="relative h-48 md:h-64 w-full rounded-xl overflow-hidden cursor-pointer group">
          <Image
            src={course.thumbnail || "/images/course-placeholder.jpg"}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

          {/* Preview Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              Preview
            </span>
          </div>

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
              <Play className="w-8 h-8 md:w-10 md:h-10 text-red-600 ml-1" />
            </div>
          </div>
        </div>
      </DialogTrigger>

      {/* Modal */}
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-0">
        <DialogTitle className="sr-only">
          Course Preview: {course.title}
        </DialogTitle>

        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video */}
        <div className="relative aspect-video w-full">
          <video
            src={preview}
            controls
            autoPlay
            // crossOrigin="use-credentials"
            preload="metadata"
            className="w-full h-full"
            poster={course.thumbnail}
          />
        </div>

        {/* Info */}
        <div className="bg-white dark:bg-gray-900 p-4">
          <h3 className="font-semibold text-lg">{course.title}</h3>
          <h3 className="font-semibold text-lg">
            {preview ? "Preview Available" : "No Preview Available"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Watch this preview to get an overview of the course
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
