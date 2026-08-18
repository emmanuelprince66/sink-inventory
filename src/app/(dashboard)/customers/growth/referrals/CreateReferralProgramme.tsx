"use client";

import { useCreateReferralProgrammeMutation } from "@/api/customer-referral";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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

const CreateReferralProgramme = ({
  business_id,
  onCreated,
  onCancel,
}: {
  business_id: string;
  onCreated: () => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [rewardPercentage, setRewardPercentage] = useState("5");
  const [rewardCap, setRewardCap] = useState("50");
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: create, isPending } = useCreateReferralProgrammeMutation({
    business_id,
    onSuccess: onCreated,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Give the programme a name.");

    const percentage = Number(rewardPercentage);
    if (!percentage || percentage <= 0)
      return setError("Enter a reward percentage above zero.");

    const cap = Number(rewardCap);
    // reward_cap is a required non-negative integer on the API.
    if (!Number.isInteger(cap) || cap < 0)
      return setError("The cap must be a whole number of rewards.");

    create({
      name: name.trim(),
      // The API takes a decimal string, not a number.
      reward_percentage: percentage.toFixed(2),
      reward_cap: cap,
      notify_sms: notifySms,
      notify_email: notifyEmail,
    });
  };

  return (
    <form onSubmit={submit} className="flex w-full min-w-0 flex-col gap-5">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Programme Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            value={rewardPercentage}
            inputMode="decimal"
            onChange={(e) =>
              setRewardPercentage(e.target.value.replace(/[^\d.]/g, ""))
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
            value={rewardCap}
            inputMode="numeric"
            onChange={(e) => setRewardCap(e.target.value.replace(/\D/g, ""))}
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
          on={notifySms}
          onChange={setNotifySms}
        />
        <Toggle
          label="Email notifications"
          hint="Email the referrer the same updates."
          on={notifyEmail}
          onChange={setNotifyEmail}
        />
      </div>

      {error && <p className="text-xs font-medium text-error-1">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-11 flex-1 gap-2 rounded-xl"
          disabled={isPending}
        >
          {isPending && <Spinner className="h-4 w-4" />}
          Create Programme
        </Button>
      </div>
    </form>
  );
};

export default CreateReferralProgramme;
