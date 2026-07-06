"use client";

import { cn } from "@/lib/utils";
import { ImagePlus, Video, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";

export type MediaItem = File | string;

interface MediaUploaderProps {
  /** Visual + accept-type kind. */
  kind: "image" | "video";
  /** Current value — a mix of File (newly added) and string (existing URL on edit). */
  value: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  /** Maximum number of items allowed. */
  max: number;
  /** Maximum size per file in MB. */
  maxFileSizeMB?: number;
  /** Surface validation errors to the parent (toast, FormMessage, etc.). */
  onError?: (message: string) => void;
  /** Disable interactions while a parent form is submitting. */
  disabled?: boolean;
  className?: string;
}

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm,video/x-m4v";

const isImageFile = (file: File) =>
  file.type.startsWith("image/") ||
  /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(file.name);

const isVideoFile = (file: File) =>
  file.type.startsWith("video/") ||
  /\.(mp4|mov|webm|m4v|qt)$/i.test(file.name);

/**
 * Multi-file picker for product media. Renders a grid of thumbnails with a
 * trailing "Add" tile. Existing items already on the server come in as URL
 * strings; newly picked ones come in as Files. The parent decides what to
 * send to the backend on submit.
 */
const MediaUploader = ({
  kind,
  value,
  onChange,
  max,
  maxFileSizeMB,
  onError,
  disabled,
  className,
}: MediaUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Track object URLs we create so we can revoke them when the file is removed.
  const objectUrlMapRef = useRef<Map<File, string>>(new Map());

  // Revoke any leftover object URLs on unmount.
  useEffect(() => {
    return () => {
      objectUrlMapRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlMapRef.current.clear();
    };
  }, []);

  const previewFor = useCallback((item: MediaItem): string => {
    if (typeof item === "string") return item;
    const cached = objectUrlMapRef.current.get(item);
    if (cached) return cached;
    const url = URL.createObjectURL(item);
    objectUrlMapRef.current.set(item, url);
    return url;
  }, []);

  const remaining = max - value.length;
  const accept = kind === "image" ? IMAGE_ACCEPT : VIDEO_ACCEPT;

  const handlePick = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const incoming = Array.from(files);

    // Validate kind.
    const wrongKind = incoming.find((f) =>
      kind === "image" ? !isImageFile(f) : !isVideoFile(f),
    );
    if (wrongKind) {
      onError?.(
        kind === "image"
          ? "Please select valid image files only."
          : "Please select valid video files only.",
      );
      return;
    }

    // Validate size (only when a limit is set).
    if (maxFileSizeMB) {
      const oversized = incoming.find(
        (f) => f.size > maxFileSizeMB * 1024 * 1024,
      );
      if (oversized) {
        onError?.(
          `Each ${kind} must be ${maxFileSizeMB}MB or smaller. "${oversized.name}" is too large.`,
        );
        return;
      }
    }

    const room = max - value.length;
    if (room <= 0) {
      onError?.(`You can only upload up to ${max} ${kind}s.`);
      return;
    }

    const trimmed = incoming.slice(0, room);
    if (trimmed.length < incoming.length) {
      onError?.(`Only the first ${trimmed.length} file(s) were added.`);
    }

    onChange([...value, ...trimmed]);
  };

  const removeAt = (index: number) => {
    const item = value[index];
    if (item instanceof File) {
      const url = objectUrlMapRef.current.get(item);
      if (url) URL.revokeObjectURL(url);
      objectUrlMapRef.current.delete(item);
    }
    onChange(value.filter((_, i) => i !== index));
  };

  const counterText = useMemo(
    () => `${value.length}/${max} ${kind === "image" ? "images" : "videos"}`,
    [value.length, max, kind],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-md border border-gray-200 overflow-hidden group bg-gray-50"
          >
            {kind === "image" ? (
              <img
                src={previewFor(item)}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={previewFor(item)}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              disabled={disabled}
              className={cn(
                "absolute top-1 right-1 bg-white/95 hover:bg-white rounded-full p-1 shadow",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                disabled && "cursor-not-allowed opacity-50",
              )}
              aria-label={`Remove ${kind} ${index + 1}`}
            >
              <X className="w-3 h-3 text-gray-700" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <label
            className={cn(
              "aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400",
              "hover:border-green-400 hover:text-green-500 cursor-pointer transition-colors",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {kind === "image" ? (
              <ImagePlus className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">
              Add {kind === "image" ? "image" : "video"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={remaining > 1}
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                handlePick(e.target.files);
                if (e.target) e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <p className="text-[11px] text-gray-500">
        {counterText}
        {maxFileSizeMB ? ` • max ${maxFileSizeMB}MB each` : ""}
      </p>
    </div>
  );
};

export default MediaUploader;
