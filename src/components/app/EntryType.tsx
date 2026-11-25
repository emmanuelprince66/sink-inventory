"use client";

import { cn } from "@/lib/utils";
import {
  ENTRY_TYPES,
  entryTypeLabel,
  entryTypeOf,
  type EntryType,
} from "@/types/expense-governance";

/** Expense / Purchase / Transfer, with a line saying what the choice counts toward. */
export const EntryTypePicker = ({
  value,
  onChange,
  className,
}: {
  value: EntryType;
  onChange: (value: EntryType) => void;
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    <p className="text-sm font-medium text-grey-2">Type</p>
    <div
      role="radiogroup"
      aria-label="Entry type"
      className="grid grid-cols-3 gap-1 rounded-xl bg-grey-6 p-1"
    >
      {ENTRY_TYPES.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-lg text-xs font-bold transition-colors cursor-pointer",
              active
                ? "bg-white text-primary-green-300 shadow-sm"
                : "text-grey-3 hover:text-grey-1",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
    <p className="text-xs text-grey-3">
      {ENTRY_TYPES.find((option) => option.value === value)?.hint}
    </p>
  </div>
);

/** Marks purchases and transfers in a list; plain expenses stay unmarked. */
export const EntryTypeBadge = ({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) => {
  const type = entryTypeOf(value);
  if (type === "EXPENSE") return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        type === "PURCHASE"
          ? "bg-primary-green-500 text-primary-green-300"
          : "bg-grey-6 text-grey-3",
        className,
      )}
    >
      {entryTypeLabel(type)}
    </span>
  );
};
