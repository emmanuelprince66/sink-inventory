"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DirectorDetails, DirectorErrors } from "@/hooks/useKycHook";
import { cn } from "@/lib/utils";
import { CheckCircle2, Trash2, UserRound } from "lucide-react";
import { ReactNode } from "react";
import FileUploadField from "./FileUploadField";
import { DIRECTOR_DOCUMENTS, DirectorDocKey } from "./tiers";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

/** Directors live outside react-hook-form, so they get a plain label/error row. */
const Field = ({ id, label, error, children }: FieldProps) => (
  <div>
    <label htmlFor={id} className="text-sm font-semibold text-grey-2">
      {label} <span className="text-error-1">*</span>
    </label>
    <div className="mt-1.5">{children}</div>
    {error && <p className="mt-1.5 text-xs text-error-1">{error}</p>}
  </div>
);

interface DirectorCardProps {
  director: DirectorDetails;
  index: number;
  /** The first director is the primary contact and cannot be removed. */
  canRemove: boolean;
  errors?: DirectorErrors;
  onChange: (field: "name", value: string) => void;
  onFileChange: (key: DirectorDocKey, file: File | null) => void;
  onRemove: () => void;
}

/**
 * One director's record: their name and the two documents the endpoint takes
 * for them. Rendered once per entry in the directors array, so adding a
 * director is just pushing another of these.
 */
const DirectorCard = ({
  director,
  index,
  canRemove,
  errors,
  onChange,
  onFileChange,
  onRemove,
}: DirectorCardProps) => {
  const uploaded = DIRECTOR_DOCUMENTS.filter(
    (doc) => director.files[doc.key],
  ).length;
  const complete =
    uploaded === DIRECTOR_DOCUMENTS.length && Boolean(director.name.trim());

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 sm:p-5",
        errors && Object.keys(errors).length
          ? "border-error-1/40"
          : "border-border-tint",
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-3 border-b border-grey-6 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full",
              complete
                ? "bg-primary-green-300 text-white"
                : "bg-grey-6 text-grey-3",
            )}
          >
            {complete ? <CheckCircle2 size={16} /> : <UserRound size={15} />}
          </span>
          <div>
            <p className="text-sm font-bold text-grey-1">
              Director {index + 1}
              {index === 0 && (
                <span className="ml-2 rounded-full bg-secondary-6 px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary-green-100">
                  Primary
                </span>
              )}
            </p>
            <p className="text-xs text-grey-3">
              {uploaded} of {DIRECTOR_DOCUMENTS.length} documents uploaded
            </p>
          </div>
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-error-1 hover:bg-error-2/40 hover:text-error-1"
          >
            <Trash2 size={14} />
            Remove
          </Button>
        )}
      </header>

      <Field id={`${director.id}-name`} label="Full name" error={errors?.name}>
        <Input
          id={`${director.id}-name`}
          placeholder="Enter the director's full name"
          value={director.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </Field>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {DIRECTOR_DOCUMENTS.map((doc) => (
          <FileUploadField
            key={doc.key}
            compact
            id={`${director.id}-${doc.key}`}
            label={doc.label}
            hint={doc.hint}
            accept={doc.accept}
            value={director.files[doc.key]}
            onChange={(file) => onFileChange(doc.key, file)}
            error={errors?.[doc.key]}
          />
        ))}
      </div>
    </div>
  );
};

export default DirectorCard;
