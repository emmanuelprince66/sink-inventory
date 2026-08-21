"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { WizardState } from "../config";

/** Every step reads the answers and writes back through the same setter. */
export interface StepProps {
  state: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
}

/**
 * The title/subtitle block and vertical rhythm every step shares.
 * gap over space-y: steps render children conditionally, and space-y's
 * `> * + *` selector skips whichever child happens to be absent.
 */
export const StepShell = ({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-6">
    <div>
      <h3 className="text-lg font-extrabold text-grey-1">{title}</h3>
      <p className="mt-1 text-xs text-grey-3">{subtitle}</p>
    </div>
    {children}
  </div>
);

/** Small uppercase label used above every field in the wizard. */
export const FieldLabel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <label
    className={cn(
      "text-[10px] font-bold uppercase tracking-wider text-grey-3",
      className,
    )}
  >
    {children}
  </label>
);

/** Radio-style option row used by Goal, Style, Time and Expiry. */
export const OptionRow = ({
  selected,
  icon,
  title,
  text,
  onSelect,
}: {
  selected: boolean;
  icon: string;
  title: string;
  text: string;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer",
      selected
        ? "border-primary-green-300 bg-primary-green-500"
        : "border-grey-5 bg-white hover:border-primary-green-300/50",
    )}
  >
    <span
      className={cn(
        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary-green-300" : "border-grey-5",
      )}
    >
      {selected && (
        <span className="h-2 w-2 rounded-full bg-primary-green-300" />
      )}
    </span>
    <span className="min-w-0">
      <span className="flex items-center gap-1.5 text-sm font-bold text-grey-1">
        <span aria-hidden>{icon}</span>
        {title}
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-grey-3">
        {text}
      </span>
    </span>
  </button>
);
