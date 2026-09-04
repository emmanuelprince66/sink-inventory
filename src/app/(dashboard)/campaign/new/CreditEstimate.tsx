"use client";

import type { CampaignEstimate } from "@/api/campaign/estimate-campaign";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { AlertTriangle, UserMinus, Zap } from "lucide-react";
import Link from "next/link";

/** Credits are decimals now, so 42.6 has to read as 42.6 and 40 as 40. */
const credits = (value: string | number | undefined | null): string => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
};

const EstimateRow = ({
  label,
  value,
  emphasis,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: "positive" | "negative";
  muted?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span className={muted ? "text-grey-4" : "text-grey-3"}>{label}</span>
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
 * What this send will actually reach, and cost.
 *
 * Every figure here comes from the estimate endpoint rather than from counting
 * the selection. Two things make the local count wrong: a customer sitting in
 * a group, a segment and the picked list is one recipient, not three; and
 * anyone without an email — or without a valid phone, on SMS — is not a
 * recipient at all. Both are only knowable server-side, and both change what
 * is charged.
 *
 * `fallbackUnitCost` covers the moment before the first estimate lands, so the
 * panel says what a channel costs rather than flashing zeroes.
 */
const CreditEstimate = ({
  channelLabel,
  estimate,
  isLoading,
  hasSelection,
  fallbackUnitCost,
}: {
  channelLabel: string;
  estimate?: CampaignEstimate;
  isLoading?: boolean;
  hasSelection: boolean;
  fallbackUnitCost: number;
}) => {
  const short = estimate ? !estimate.sufficient_credit : false;
  const shortfall = estimate
    ? Number(estimate.credits_required) - Number(estimate.current_balance)
    : 0;

  return (
    <div className="rounded-2xl border border-grey-5 bg-white p-5">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-grey-1">
        <Zap className="w-4 h-4 text-warning-1" />
        Credit Estimate
      </p>

      {!hasSelection ? (
        <p className="mt-4 text-xs text-grey-4">
          Pick who this goes to and the cost appears here.
        </p>
      ) : isLoading && !estimate ? (
        <div className="mt-6 flex justify-center">
          <Spinner />
        </div>
      ) : !estimate ? (
        <p className="mt-4 text-xs text-grey-4">
          Around {credits(fallbackUnitCost)} credits per{" "}
          {channelLabel.toLowerCase()}. The exact cost appears once the
          audience has been checked.
        </p>
      ) : (
        <>
          <div className={cn("mt-4 space-y-3", isLoading && "opacity-60")}>
            <EstimateRow
              label="Customers selected"
              value={estimate.total_unique_customers}
            />
            <EstimateRow
              label="Will receive it"
              value={estimate.reachable_recipients}
            />
            <EstimateRow
              label={`Credits per ${channelLabel.toLowerCase()}`}
              value={credits(estimate.unit_cost)}
            />
            <EstimateRow
              label="Total credits needed"
              value={credits(estimate.credits_required)}
            />
            <EstimateRow
              label="Available credits"
              value={credits(estimate.current_balance)}
            />
          </div>

          <div className="mt-3 border-t border-grey-5 pt-3">
            <EstimateRow
              label="Remaining after send"
              value={credits(estimate.balance_after)}
              emphasis={short ? "negative" : "positive"}
            />
          </div>

          {/* The gap between who was picked and who can actually be reached.
              Without this the merchant selects 150 people, is charged for 142
              and has no idea why. */}
          {estimate.unreachable_count > 0 && (
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-grey-6 px-3 py-2 text-[11px] text-grey-3">
              <UserMinus className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                {estimate.unreachable_count} of the{" "}
                {estimate.total_unique_customers} selected{" "}
                {estimate.unreachable_count === 1 ? "has" : "have"} no{" "}
                {channelLabel.toLowerCase() === "email"
                  ? "email address"
                  : "usable phone number"}{" "}
                on file, so {estimate.unreachable_count === 1 ? "it" : "they"}{" "}
                won&apos;t be sent to — or charged for.
              </span>
            </p>
          )}

          {short && (
            <div className="mt-3 rounded-lg bg-error-1/10 px-3 py-2">
              <p className="flex items-start gap-1.5 text-[11px] font-bold text-error-1">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  You need {credits(Math.max(0, shortfall))} more credit
                  {Math.abs(shortfall) === 1 ? "" : "s"} to send this campaign.
                </span>
              </p>
              <Link
                href="/campaign/fund"
                className="mt-1.5 inline-block text-[11px] font-bold text-primary-green-300 hover:underline"
              >
                Top up credits →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreditEstimate;
