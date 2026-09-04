"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

const EstimateRow = ({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: "positive" | "negative";
}) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span className="text-grey-3">{label}</span>
    <span
      className={cn(
        "font-extrabold",
        emphasis === "negative" && "text-error-1",
        emphasis === "positive" && "text-primary-green-300",
        !emphasis && "text-grey-1",
      )}
    >
      {value}
    </span>
  </div>
);

/**
 * What this send will cost, worked out from the same numbers the composer
 * validates against — so a merchant never gets as far as pressing Send only
 * to be told the balance was short.
 */
const CreditEstimate = ({
  channelLabel,
  recipients,
  creditsPerMessage,
  totalCredits,
  availableCredits,
}: {
  channelLabel: string;
  recipients: number;
  creditsPerMessage: number;
  totalCredits: number;
  availableCredits: number;
}) => {
  const remaining = availableCredits - totalCredits;
  const short = remaining < 0;

  return (
    <div className="rounded-2xl border border-grey-5 bg-white p-5">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-grey-1">
        <Zap className="w-4 h-4 text-warning-1" />
        Credit Estimate
      </p>

      <div className="mt-4 space-y-3">
        <EstimateRow label="Recipients selected" value={recipients} />
        <EstimateRow
          label={`Credits per ${channelLabel.toLowerCase()}`}
          value={creditsPerMessage}
        />
        <EstimateRow label="Total credits needed" value={totalCredits} />
        <EstimateRow label="Available credits" value={availableCredits} />
      </div>

      <div className="mt-3 border-t border-grey-5 pt-3">
        <EstimateRow
          label="Remaining after send"
          value={short ? `${remaining}` : remaining}
          emphasis={short ? "negative" : "positive"}
        />
      </div>

      {short && (
        <p className="mt-3 rounded-lg bg-error-1/10 px-3 py-2 text-[11px] font-bold text-error-1">
          You need {Math.abs(remaining)} more credit
          {Math.abs(remaining) === 1 ? "" : "s"} to send this campaign.
        </p>
      )}
    </div>
  );
};

export default CreditEstimate;
