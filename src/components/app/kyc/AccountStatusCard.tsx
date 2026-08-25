"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { useKycHook } from "@/hooks/useKycHook";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

type Verification = ReturnType<typeof useKycHook>["verification"];

const Flag = ({ label, on }: { label: string; on: boolean }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold",
      on ? "bg-secondary-6 text-primary-green-100" : "bg-grey-6 text-grey-3",
    )}
  >
    {on ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
    {label}
  </span>
);

/**
 * The account this verification belongs to, as the wallet endpoint reports it:
 * the settlement account, the tier it sits on, and which identifiers are on
 * file. Everything here is live — nothing on this card is a placeholder.
 */
const AccountStatusCard = ({
  verification,
}: {
  verification: Verification;
}) => {
  if (verification.isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-border-tint bg-white p-4">
        <Skeleton className="h-3 w-24 bg-grey-5" />
        <Skeleton className="h-5 w-40 bg-grey-5" />
        <Skeleton className="h-8 w-full bg-grey-5" />
      </div>
    );
  }

  const wallet = verification.wallet;

  // No wallet means no account has been opened yet — the tier rail below is
  // the whole story, so don't render an empty card above it.
  if (!wallet) return null;

  return (
    <div className="rounded-2xl border border-border-tint bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-grey-3">
          Settlement account
        </p>
        {verification.tierLabel && (
          <span className="rounded-full bg-primary-green-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
            {verification.tierLabel}
          </span>
        )}
      </div>

      <p className="mt-2 truncate text-sm font-bold text-grey-1">
        {wallet.account_name}
      </p>
      <p className="text-xs text-grey-3">
        {wallet.account_number}
        {wallet.bank_name ? ` · ${wallet.bank_name}` : ""}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-grey-6 pt-3">
        <Flag label="NIN" on={verification.hasNin} />
        <Flag label="BVN" on={verification.hasBvn} />
        <Flag label="Address" on={verification.hasAddress} />
      </div>
    </div>
  );
};

export default AccountStatusCard;
