"use client";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCampaignHook } from "@/hooks/useCampaignHook";
import { cn } from "@/lib/utils";
import { formatToNaira, getCurrencySymbol } from "@/utils/formatMoney";
import {
  Building2,
  ChevronLeft,
  CreditCard,
  Infinity as InfinityIcon,
  Mail,
  Smartphone,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * What one unit costs, and what it buys.
 *
 * Kept here as named constants rather than sprinkled through the copy: the
 * rate appears in five places on this screen — the subtitle, the preset
 * hint, the order summary, the "how units work" panel and the running
 * conversion — and they must never disagree with each other.
 */
const NAIRA_PER_UNIT = 10;
const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

const PAYMENT_METHODS = [
  {
    key: "bank",
    label: "Bank Transfer",
    caption: "Instant · Free",
    icon: Building2,
  },
  {
    key: "card",
    label: "Debit Card",
    caption: "Instant · Free",
    icon: CreditCard,
  },
] as const;

const SummaryRow = ({
  label,
  value,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-grey-3">{label}</span>
    <span
      className={cn(
        "font-bold",
        muted ? "text-grey-4" : "text-grey-1",
        "text-right",
      )}
    >
      {value}
    </span>
  </div>
);

const FundMessageCredits = () => {
  const {
    onSubmitFundCampaign,
    fundCampaignLoading,
    businessData,
    BusinessDataLoading,
  } = useCampaignHook({});

  const [amount, setAmount] = useState("");
  const [method, setMethod] =
    useState<(typeof PAYMENT_METHODS)[number]["key"]>("bank");

  const symbol = getCurrencySymbol();
  const naira = Number(amount || 0);
  const units = Math.floor(naira / NAIRA_PER_UNIT);
  const balance = Number(businessData?.message_credit ?? 0);
  const usedThisMonth = Number(businessData?.message_credit_used ?? 0);

  // Nothing to buy below one unit's worth, so the button stays off rather
  // than sending an amount the backend would reject.
  const canSubmit = units > 0 && !fundCampaignLoading;

  const handleFund = () => {
    if (!canSubmit) return;
    onSubmitFundCampaign({ amount: String(naira) });
  };

  return (
    <div className="w-full h-full flex flex-col gap-5">
      <div>
        <Link
          href="/campaign"
          className="inline-flex items-center gap-1 text-sm font-bold text-grey-3 hover:text-primary-green-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Campaign
        </Link>

        <p className="mt-2 text-2xl md:text-3xl text-grey-1 font-extrabold">
          Fund Message Credits
        </p>
        <p className="text-sm text-grey-3 mt-1">
          Purchase credit units to power your campaigns.{" "}
          <span className="font-bold text-primary-green-300">
            {symbol}
            {NAIRA_PER_UNIT} = 1 unit.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ── Left: balance, amount, payment method ─────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-grey-5 bg-white p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary-6 rounded-full shrink-0">
                <Zap className="w-4 h-4 text-primary-green-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary-green-300">
                  Current Balance
                </p>
                <p className="text-xl font-extrabold text-grey-1">
                  {BusinessDataLoading ? "—" : balance} units
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-grey-3">Used this month</p>
              <p className="text-base font-extrabold text-grey-1">
                {BusinessDataLoading ? "—" : usedThisMonth} units
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-grey-5 bg-white p-5">
            <p className="text-sm font-extrabold text-grey-1">
              Enter Amount ({symbol})
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-bold transition-colors cursor-pointer",
                    naira === preset
                      ? "border-primary-green-300 bg-secondary-6 text-primary-green-300"
                      : "border-grey-5 text-grey-2 hover:border-primary-green-300/50",
                  )}
                >
                  {symbol}
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative mt-4">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-grey-3">
                {symbol}
              </span>
              <Input
                value={amount}
                inputMode="numeric"
                placeholder="0"
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                className="h-12 rounded-xl pl-9 text-base font-bold"
              />
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-xs text-grey-4">
              <Zap className="w-3.5 h-3.5 text-warning-1 shrink-0" />
              Rate: {symbol}
              {NAIRA_PER_UNIT} = 1 unit · 1 unit = 1 SMS, or 3 emails
            </p>
          </div>

          <div className="rounded-2xl border border-grey-5 bg-white p-5">
            <p className="text-sm font-extrabold text-grey-1">Payment Method</p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((option) => {
                const Icon = option.icon;
                const selected = method === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setMethod(option.key)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                      selected
                        ? "border-primary-green-300 bg-secondary-6"
                        : "border-grey-5 hover:border-primary-green-300/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                        selected
                          ? "bg-primary-green-300 text-white"
                          : "bg-grey-6 text-grey-3",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-grey-1">
                        {option.label}
                      </span>
                      <span className="block text-xs text-grey-3">
                        {option.caption}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: what the purchase comes to ─────────────────────────── */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-grey-5 bg-white p-5">
            <p className="text-sm font-extrabold text-grey-1">Order Summary</p>

            <div className="mt-4 space-y-3">
              <SummaryRow
                label="Amount"
                value={naira > 0 ? formatToNaira(naira) : "—"}
                muted={naira <= 0}
              />
              <SummaryRow
                label="Exchange rate"
                value={`${symbol}${NAIRA_PER_UNIT} / unit`}
              />
              <SummaryRow
                label="Units purchased"
                value={units > 0 ? units.toLocaleString() : "—"}
                muted={units <= 0}
              />
              <SummaryRow
                label="Current balance"
                value={`${balance.toLocaleString()} units`}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-grey-5">
              <SummaryRow
                label="New balance"
                value={
                  units > 0 ? (
                    <span className="text-primary-green-300">
                      {(balance + units).toLocaleString()} units
                    </span>
                  ) : (
                    "—"
                  )
                }
                muted={units <= 0}
              />
            </div>

            <Button
              onClick={handleFund}
              disabled={!canSubmit}
              className="mt-4 h-11 w-full gap-1.5 rounded-xl"
            >
              {fundCampaignLoading ? (
                <Spinner />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Fund Campaign
                </>
              )}
            </Button>

            {units <= 0 && (
              <p className="mt-2 text-center text-xs text-grey-4">
                Enter an amount to calculate units
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-grey-5 bg-white p-5">
            <p className="text-sm font-extrabold text-grey-1">
              How units work
            </p>

            <ul className="mt-3 space-y-2.5 text-xs text-grey-3">
              <li className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 shrink-0 text-grey-4" />
                1 unit = 1 SMS (up to 160 chars)
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0 text-grey-4" />
                0.3 units = 1 email — 70% cheaper than SMS
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 shrink-0 text-primary-green-300" />
                {symbol}
                {NAIRA_PER_UNIT} = 1 unit
              </li>
              <li className="flex items-center gap-2">
                <InfinityIcon className="w-3.5 h-3.5 shrink-0 text-grey-4" />
                Units never expire
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundMessageCredits;
