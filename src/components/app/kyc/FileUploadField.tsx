"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";

/** Providers reject anything larger, so catch it here rather than on submit. */
const MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_ACCEPT = ".pdf,.jpg,.jpeg,.png";

const readableSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

interface FileUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  accept?: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  /** Validation message owned by the caller — shown under the drop zone. */
  error?: string;
  /** Tighter padding for the director cards, where four of these sit in a grid. */
  compact?: boolean;
}

/**
 * One document slot: drop zone until a file is chosen, then a summary row with
 * a remove button. Used by both the individual proof-of-address step and every
 * corporate/director document, so the upload affordance is identical wherever
 * KYC asks for a file.
 */
const FileUploadField = ({
  id,
  label,
  hint,
  accept = DEFAULT_ACCEPT,
  required = true,
  value,
  onChange,
  error,
  compact = false,
}: FileUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setSizeError(`${file.name} is ${readableSize(file.size)} — the limit is 5 MB.`);
      return;
    }
    setSizeError(null);
    onChange(file);
  };

  const message = sizeError ?? error;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-grey-2">
          {label}
          {required && <span className="text-error-1"> *</span>}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-1">
            <CheckCircle2 size={13} /> Added
          </span>
        )}
      </div>

      {hint && <p className="mt-1 text-xs text-grey-3">{hint}</p>}

      {value ? (
        <div
          className={cn(
            "mt-2 flex items-center gap-3 rounded-xl border border-secondary-2 bg-secondary-6/60",
            compact ? "px-3 py-2.5" : "px-4 py-3",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary-green-300">
            <FileText size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-grey-1">
              {value.name}
            </p>
            <p className="text-xs text-grey-3">{readableSize(value.size)}</p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => {
              onChange(null);
              setSizeError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="cursor-pointer rounded-lg p-1.5 text-grey-3 transition-colors hover:bg-white hover:text-error-1"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            acceptFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-white transition-colors",
            compact ? "px-3 py-3" : "px-4 py-4",
            dragging
              ? "border-primary-green-300 bg-secondary-6/50"
              : message
                ? "border-error-1"
                : "border-grey-5 hover:border-primary-green-300 hover:bg-secondary-6/30",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-grey-6 text-grey-3">
            <Paperclip size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-green-300">
              Choose a file
            </p>
            <p className="text-xs text-grey-3">
              or drop it here · PDF, JPG or PNG up to 5 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => acceptFile(e.target.files?.[0])}
      />

      {message && <p className="mt-1.5 text-xs text-error-1">{message}</p>}
    </div>
  );
};

export default FileUploadField;
