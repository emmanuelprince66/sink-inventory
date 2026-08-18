"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  CustomerReferralProgrammeCreate,
  CustomerReferralProgrammeUpdate,
} from "@/types/customerReferral";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useState } from "react";

const Toggle = ({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={() => onChange(!on)}
    className={cn(
      "flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer",
      on
        ? "border-primary-green-300 bg-primary-green-500"
        : "border-grey-5 bg-white",
    )}
  >
    <span className="min-w-0">
      <span className="block text-sm font-bold text-grey-1">{label}</span>
      <span className="block text-[11px] text-grey-3">{hint}</span>
    </span>
    <span
      className={cn(
        "flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
        on ? "bg-primary-green-300" : "bg-grey-5",
      )}
    >
      <span
        className={cn(
          "h-4 w-4 rounded-full bg-white transition-transform",
          on && "translate-x-4",
        )}
      />
    </span>
  </button>
);

export interface ReferralProgrammeFormValues {
  name: string;
  reward_percentage: string;
  reward_cap: string;
  notify_sms: boolean;
  notify_email: boolean;
  is_active: boolean;
}

export const EMPTY_PROGRAMME: ReferralProgrammeFormValues = {
  name: "",
  reward_percentage: "5",
  reward_cap: "50",
  notify_sms: true,
  notify_email: false,
  // Only surfaced when editing; a newly created programme starts running and
  // the create schema has no is_active field to send.
  is_active: true,
};

/**
 * The fields behind both creating a programme and editing one. Kept in one
 * place so the two paths cannot validate differently or disagree about how a
 * percentage is serialised.
 */
const ReferralProgrammeForm = ({
  initial = EMPTY_PROGRAMME,
  submitLabel,
  pending,
  includeActive = false,
  onSubmit,
  onCancel,
}: {
  initial?: ReferralProgrammeFormValues;
  submitLabel: string;
  pending: boolean;
  /** Editing only — shows the running/paused switch and sends is_active. */
  includeActive?: boolean;
  onSubmit: (
    payload: CustomerReferralProgrammeCreate & CustomerReferralProgrammeUpdate,
  ) => void;
  onCancel?: () => void;
}) => {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ReferralProgrammeFormValues>(
    key: K,
    value: ReferralProgrammeFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) return setError("Give the programme a name.");

    const percentage = Number(values.reward_percentage);
    if (!percentage || percentage <= 0)
      return setError("Enter a reward percentage above zero.");

    const cap = Number(values.reward_cap);
    // reward_cap is a required non-negative integer on the API.
    if (!Number.isInteger(cap) || cap < 0)
      return setError("The cap must be a whole number of rewards.");

    onSubmit({
      name: values.name.trim(),
      // The API takes a decimal string, not a number.
      reward_percentage: percentage.toFixed(2),
      reward_cap: cap,
      notify_sms: values.notify_sms,
      notify_email: values.notify_email,
      // Omitted entirely on create — the schema has no such field.
      ...(includeActive ? { is_active: values.is_active } : {}),
    });
  };

  return (
    <form onSubmit={submit} className="flex w-full min-w-0 flex-col gap-5">
      {includeActive && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-xl border p-3.5",
            values.is_active
              ? "border-primary-green-300/40 bg-primary-green-500"
              : "border-grey-5 bg-grey-6/60",
          )}
        >
          <span className="flex min-w-0 items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 shrink-0",
                values.is_active ? "text-primary-green-300" : "text-grey-4",
              )}
            >
              {values.is_active ? (
                <PlayCircle className="h-5 w-5" />
              ) : (
                <PauseCircle className="h-5 w-5" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-grey-1">
                {values.is_active ? "Programme is running" : "Programme is paused"}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-grey-3">
                {values.is_active
                  ? "Existing links keep working and new referrals earn rewards."
                  : "Links still resolve, but referrals stop earning until you start it again."}
              </span>
            </span>
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={values.is_active}
            aria-label={
              values.is_active ? "Pause programme" : "Start programme"
            }
            onClick={() => set("is_active", !values.is_active)}
            className={cn(
              "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer",
              values.is_active ? "bg-primary-green-300" : "bg-grey-5",
            )}
          >
            <span
              className={cn(
                "h-5 w-5 rounded-full bg-white transition-transform",
                values.is_active && "translate-x-5",
              )}
            />
          </button>
        </div>
      )}

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Programme Name
        </label>
        <Input
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Bring a Friend"
          className="mt-2 h-11 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Reward Rate (%)
          </label>
          <Input
            value={values.reward_percentage}
            inputMode="decimal"
            onChange={(e) =>
              set("reward_percentage", e.target.value.replace(/[^\d.]/g, ""))
            }
            placeholder="5"
            className="mt-2 h-11 rounded-xl"
          />
          <p className="mt-1.5 text-[11px] text-grey-3">
            Share of the referred customer&apos;s spend paid to the referrer.
          </p>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Reward Cap
          </label>
          <Input
            value={values.reward_cap}
            inputMode="numeric"
            onChange={(e) =>
              set("reward_cap", e.target.value.replace(/\D/g, ""))
            }
            placeholder="50"
            className="mt-2 h-11 rounded-xl"
          />
          <p className="mt-1.5 text-[11px] text-grey-3">
            Most rewards this programme will ever pay out.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Toggle
          label="SMS notifications"
          hint="Text the referrer when a referral lands."
          on={values.notify_sms}
          onChange={(next) => set("notify_sms", next)}
        />
        <Toggle
          label="Email notifications"
          hint="Email the referrer the same updates."
          on={values.notify_email}
          onChange={(next) => set("notify_email", next)}
        />
      </div>

      {error && <p className="text-xs font-medium text-error-1">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="h-11 flex-1 gap-2 rounded-xl"
          disabled={pending}
        >
          {pending && <Spinner className="h-4 w-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ReferralProgrammeForm;
