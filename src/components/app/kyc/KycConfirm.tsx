"use client";

import { Button } from "@/components/ui/button";
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
import { CORPORATE_TIERS, INDIVIDUAL_TIERS, KycTier } from "./tiers";

type AccountType = "individual" | "corporate";

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

/**
 * The KYC screen — a full page rather than a modal.
 *
 * Corporate Tier 2 alone runs to four company documents plus four uploads per
 * director, which a dialog cannot hold; the page also means a half-finished
 * verification survives a stray click outside.
 */
const KycConfirm = () => {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [selection, setSelection] = useState<AccountType>("individual");

  const chosen = ACCOUNT_TYPES.find((type) => type.value === accountType);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        {accountType && (
          <button
            type="button"
            onClick={() => setAccountType(null)}
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-grey-3 transition-colors hover:text-primary-green-300"
          >
            <ArrowLeft size={15} />
            Change account type
          </button>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-grey-1 sm:text-3xl">
              {chosen ? chosen.title : "Verify your identity"}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-grey-3">
              {chosen
                ? "Complete a tier to raise your daily limit. Each tier builds on the one before it, and you can stop at any point."
                : "CBN regulations require every SYNC360 merchant to verify their identity before receiving settlements. Pick the account type that matches your business."}
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-border-tint bg-white px-3 py-2 text-xs font-semibold text-grey-3">
            <Lock size={13} className="text-primary-green-300" />
            Encrypted &amp; verified by licensed providers
          </span>
        </div>
      </header>

      {chosen ? (
        chosen.value === "individual" ? (
          <IndividualTierFlow />
        ) : (
          <CorporateAcct />
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
              onClick={() => setAccountType(selection)}
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
