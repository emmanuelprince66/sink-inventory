"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { type AccountType, useKycHook } from "@/hooks/useKycHook";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";

import CorporateAcct from "./CorporateAcct";
import IndividualTierFlow from "./IndividualAcct";
import { Notice } from "./KycUi";
import { CORPORATE_TIERS, INDIVIDUAL_TIERS, KycTier } from "./tiers";

const ACCOUNT_TYPES: {
  value: AccountType;
  title: string;
  blurb: string;
  icon: typeof User;
  tiers: KycTier[];
}[] = [
  {
    value: "individual",
    title: "Individual account",
    blurb: "For sole traders and personal settlements.",
    icon: User,
    tiers: INDIVIDUAL_TIERS,
  },
  {
    value: "corporate",
    title: "Corporate account",
    blurb: "For CAC-registered businesses with directors.",
    icon: Briefcase,
    tiers: CORPORATE_TIERS,
  },
];

const ChooserSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {[0, 1].map((i) => (
      <Skeleton key={i} className="h-64 rounded-2xl bg-grey-5" />
    ))}
  </div>
);

/**
 * The KYC screen — a full page rather than a modal.
 *
 * Corporate Tier 2 alone runs to four company documents plus four uploads per
 * director, which a dialog cannot hold; the page also means a half-finished
 * verification survives a stray click outside.
 *
 * The hook lives here and is handed to whichever flow renders, so the account
 * payload is read once and the chooser, the tier rail and the forms all agree
 * on what has already been verified.
 */
const KycConfirm = () => {
  const kyc = useKycHook();
  const { verification } = kyc;

  // Set only when the merchant picks a type on this screen. An account that
  // has already been opened supplies its own, so the chooser is skipped
  // entirely rather than asking a question that is already answered.
  const [picked, setPicked] = useState<AccountType | null>(null);
  const [selection, setSelection] = useState<AccountType>("individual");

  const resumedType = verification.hasStarted
    ? (verification.accountType ?? "individual")
    : null;
  const activeType = picked ?? resumedType;

  /** True when the merchant is opening a corporate account on top of an
   *  individual one, rather than continuing what they started. */
  const isUpgrading =
    activeType === "corporate" && resumedType === "individual";

  const chosen = ACCOUNT_TYPES.find((type) => type.value === activeType);

  const headline = () => {
    if (!chosen) return "Verify your identity";
    if (isUpgrading) return "Upgrade to a corporate account";
    if (verification.hasStarted) return `Continue verification`;
    return chosen.title;
  };

  const subhead = () => {
    if (!chosen)
      return "CBN regulations require every SYNC360 merchant to verify their identity before receiving settlements. Pick the account type that matches your business.";
    if (isUpgrading)
      return "Your individual verification stays as it is while we review the company's documents.";
    if (verification.hasStarted)
      return "Pick up where you left off. Each tier builds on the one before it, and you can stop at any point.";
    return "Complete a tier to raise your daily limit. Each tier builds on the one before it, and you can stop at any point.";
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        {/* Only offered while nothing has been submitted — once an account
            exists its type is set, and "corporate" becomes an upgrade rather
            than a different answer to the same question. */}
        {picked && !verification.hasStarted && (
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-grey-3 transition-colors hover:text-primary-green-300"
          >
            <ArrowLeft size={15} />
            Change account type
          </button>
        )}

        {isUpgrading && (
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-grey-3 transition-colors hover:text-primary-green-300"
          >
            <ArrowLeft size={15} />
            Back to my individual verification
          </button>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-grey-1 sm:text-3xl">
              {headline()}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-grey-3">{subhead()}</p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-border-tint bg-white px-3 py-2 text-xs font-semibold text-grey-3">
            <Lock size={13} className="text-primary-green-300" />
            Encrypted &amp; verified by licensed providers
          </span>
        </div>
      </header>

      {isUpgrading && (
        <Notice tone="info" title="This starts a new corporate verification" className="mb-5">
          You will need your CAC documents, TIN and a record for every director.
          Nothing here changes the individual account you already verified.
        </Notice>
      )}

      {verification.isLoading && !chosen ? (
        <ChooserSkeleton />
      ) : chosen ? (
        chosen.value === "individual" ? (
          <IndividualTierFlow
            kyc={kyc}
            onUpgradeToCorporate={() => setPicked("corporate")}
          />
        ) : (
          <CorporateAcct kyc={kyc} />
        )
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {ACCOUNT_TYPES.map((type) => {
              const active = selection === type.value;
              const Icon = type.icon;

              return (
                <button
                  key={type.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelection(type.value)}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-5 text-left transition-all",
                    active
                      ? "border-primary-green-300 bg-white shadow-sm ring-1 ring-primary-green-300"
                      : "border-border-tint bg-white hover:border-secondary-3 hover:shadow-xs",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-primary-green-300 text-white"
                            : "bg-grey-6 text-grey-3",
                        )}
                      >
                        <Icon size={20} />
                      </span>
                      <div>
                        <h2 className="text-base font-bold text-grey-1">
                          {type.title}
                        </h2>
                        <p className="mt-0.5 text-sm text-grey-3">
                          {type.blurb}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        active
                          ? "border-primary-green-300 bg-primary-green-300 text-white"
                          : "border-grey-5",
                      )}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 border-t border-grey-6 pt-4">
                    {type.tiers.map((tier) => (
                      <li key={tier.tier} className="flex items-start gap-2.5">
                        <ShieldCheck
                          size={15}
                          className="mt-0.5 shrink-0 text-primary-green-300"
                        />
                        <span className="text-sm">
                          <span className="font-bold text-grey-1">
                            Tier {tier.tier} · {tier.limit} daily
                          </span>
                          <span className="block text-xs text-grey-3">
                            {tier.requirement}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              size="lg"
              onClick={() => setPicked(selection)}
              className="w-full sm:w-auto sm:min-w-64"
            >
              Continue
              <ArrowRight size={16} />
            </Button>
            <p className="text-xs text-grey-3">
              You can upgrade your tier at any time after verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycConfirm;
