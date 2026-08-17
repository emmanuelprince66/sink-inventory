"use client";

import { useFetchCustomerById } from "@/api/customer/fetch-customer-by-id";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormatMoney } from "@/utils/formatMoney";
import DataGapBadge from "@/components/app/DataGapBadge";
import {
  ChevronLeft,
  CreditCard,
  Gift,
  MessageSquare,
  Pencil,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CustomerDetail } from "../customerDetail";

const TABS = [
  "Overview",
  "Purchase",
  "Loyalty",
  "Engagement",
  "Shopping",
  "Financial",
] as const;
type Tab = (typeof TABS)[number];

const TIER_TONES: Record<string, string> = {
  VIP: "bg-violet-500/20 text-violet-300",
  Gold: "bg-amber-500/20 text-amber-300",
  Silver: "bg-white/10 text-white/70",
  Bronze: "bg-orange-500/20 text-orange-300",
};

const RISK_TONES: Record<string, string> = {
  Low: "text-primary-green-300",
  Medium: "text-warning-1",
  High: "text-orange-400",
  Critical: "text-error-1",
};

/** Compact money for the header tiles — ₦294K rather than ₦294,000. */
const compact = (amount: number, symbol: string) => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)
    return `${symbol}${(amount / 1_000).toFixed(abs < 10_000 ? 1 : 0)}K`;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
};

/** Journey milestones arrive as ISO timestamps. */
const asDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const StatTile = ({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: string;
}) => (
  <div className="rounded-xl bg-white/5 px-3 py-2.5 text-center">
    <p className={cn("text-sm font-extrabold", tone)}>{value}</p>
    <p className="mt-0.5 text-[10px] text-white/50">{label}</p>
  </div>
);

const Cell = ({
  label,
  value,
  tone = "text-grey-1",
}: {
  label: string;
  value?: string | number | null;
  tone?: string;
}) => (
  <div className="rounded-xl bg-grey-6/70 px-3 py-2.5">
    <p className="text-[10px] text-grey-3">{label}</p>
    <p className={cn("mt-0.5 text-sm font-bold", tone)}>
      {value === null || value === undefined || value === "" ? "—" : value}
    </p>
  </div>
);

/** Shared shell for the five non-overview tabs. */
const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-grey-5 bg-white p-4">
    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
      {title}
    </p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  </div>
);

const CustomerProfile = ({ id }: { id: string }) => {
  const formatMoney = useFormatMoney();
  const [tab, setTab] = useState<Tab>("Overview");
  const router = useRouter();

  const { data, isLoading } = useFetchCustomerById(id);
  const detail: CustomerDetail | undefined = data?.data ?? data;

  const symbol = formatMoney(0).replace(/[\d.,\s]/g, "") || "₦";

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  const identity = detail?.identity;
  const purchase = detail?.purchase_behaviour;
  const loyalty = detail?.loyalty_rewards;
  const engagement = detail?.engagement_metrics;
  const shopping = detail?.shopping_behaviour;
  const financial = detail?.financial_details;
  const row = detail?.data;

  const risk = engagement?.churn_risk ?? row?.risk_level ?? "Low";
  const tier = loyalty?.loyalty_tier ?? row?.tier_name;
  const location = [identity?.city, identity?.state].filter(Boolean).join(", ");

  const journey = [
    {
      label: "Customer Registered",
      iso: detail?.customer_journey?.customer_registered,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "First Purchase",
      iso: detail?.customer_journey?.first_purchase,
      tone: "bg-sky-100 text-sky-600",
    },
    {
      label: "Joined Loyalty",
      iso: detail?.customer_journey?.joined_loyalty,
      tone: "bg-amber-100 text-amber-600",
    },
    {
      label: "Reward Earned",
      iso: detail?.customer_journey?.reward_earned,
      tone: "bg-violet-100 text-violet-600",
    },
    {
      label: "Latest Purchase",
      iso: detail?.customer_journey?.latest_purchase,
      tone: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="w-full">
      {/* Dark profile header */}
      <div className="rounded-2xl bg-primary-green-100 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          {/* Goes back rather than pushing /customers, so the list keeps the
              search, filters and page the user came from. Falls back to the
              list when this page was opened directly. */}
          <button
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push("/customers");
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Customers
          </button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 rounded-lg border-white/20 bg-transparent text-xs font-bold text-white hover:bg-white/10 hover:text-white"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 rounded-lg border-white/20 bg-transparent text-xs font-bold text-white hover:bg-white/10 hover:text-white"
            >
              <Gift className="h-3.5 w-3.5" />
              Reward
            </Button>
            <Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-bold">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-green-300 text-lg font-extrabold text-white">
              {row?.initials ?? "?"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold text-white">
                {identity?.name ?? row?.name ?? "Customer"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/60">
                {tier && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      TIER_TONES[tier] ?? "bg-white/10 text-white/70",
                    )}
                  >
                    {tier}
                  </span>
                )}
                {row?.customer_code && <span>{row.customer_code}</span>}
                {identity?.gender && <span>· {identity.gender}</span>}
                {location && <span>· {location}</span>}
                {identity?.customer_since && (
                  <span>· Since {identity.customer_since}</span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[11px] text-white/70">
                {identity?.phone && <span>📞 {identity.phone}</span>}
                {identity?.email && <span>✉️ {identity.email}</span>}
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-xl bg-white/5 px-3 py-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
              Churn Risk
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-extrabold",
                RISK_TONES[risk] ?? "text-white",
              )}
            >
              {risk}
            </p>
          </div>
        </div>

        {/* Stat strip — figures come from purchase_behaviour / financial_details,
            which carry the real totals; the nested list row can read 0. */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          <StatTile
            value={compact(Number(purchase?.lifetime_value ?? 0), symbol)}
            label="Lifetime Value"
            tone="text-primary-green-300"
          />
          <StatTile
            value={String(purchase?.total_orders ?? 0)}
            label="Total Orders"
            tone="text-info-1"
          />
          <StatTile
            value={compact(Number(purchase?.average_basket_size ?? 0), symbol)}
            label="Avg Basket"
            tone="text-warning-1"
          />
          <StatTile
            value={compact(Number(purchase?.total_spend ?? 0), symbol)}
            label="Total Spend"
            tone="text-primary-green-300"
          />
          <StatTile
            value={Number(loyalty?.reward_points ?? 0).toLocaleString()}
            label="Points"
            tone="text-warning-1"
          />
          <StatTile
            value={compact(
              Number(financial?.wallet_balance ?? 0) +
                Number(financial?.credit_balance ?? 0),
              symbol,
            )}
            label="Wallet + Credit"
            tone="text-primary-green-300"
          />
          <StatTile
            value={`${Number(purchase?.retention_score ?? 0)}/100`}
            label="Score"
            tone="text-white"
          />
        </div>

        <div className="mt-4 flex gap-5 overflow-x-auto border-t border-white/10 pt-3 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "cursor-pointer whitespace-nowrap text-xs font-bold transition-colors",
                tab === t
                  ? "text-primary-green-300"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {tab === "Overview" && (
          <>
            <div className="rounded-2xl border border-grey-5 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-grey-1">
                  <Sparkles className="h-3 w-3 text-warning-1" />
                </span>
                <h3 className="text-sm font-extrabold text-grey-1">
                  AI Customer Insight
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-grey-2">
                {detail?.ai_customer_insight ??
                  "No insight available for this customer yet."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-grey-5 bg-white p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
                  Identity
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Cell label="Name" value={identity?.name} />
                  <Cell label="Gender" value={identity?.gender} />
                  <Cell
                    label="Phone"
                    value={identity?.phone}
                    tone="text-info-1"
                  />
                  <Cell label="Email" value={identity?.email} />
                  <Cell
                    label="Birthday"
                    value={identity?.birthday}
                    tone="text-violet-600"
                  />
                  <Cell
                    label="Customer Since"
                    value={identity?.customer_since}
                  />
                  <Cell label="State" value={identity?.state} />
                  <Cell label="City" value={identity?.city} />
                </div>
              </div>

              <div className="rounded-2xl border border-grey-5 bg-white p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
                  Customer Journey
                </p>
                <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-grey-5">
                  {journey.map((step) => {
                    const date = asDate(step.iso);
                    return (
                      <li
                        key={step.label}
                        className={cn(
                          "relative flex items-start gap-3",
                          !date && "opacity-40",
                        )}
                      >
                        <span
                          className={cn(
                            "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                            date ? step.tone : "bg-grey-6 text-grey-4",
                          )}
                        >
                          ●
                        </span>
                        <div>
                          <p className="text-sm font-bold text-grey-1">
                            {step.label}
                          </p>
                          <p className="text-[11px] text-grey-3">
                            {date ?? "Not yet"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </>
        )}

        {tab === "Purchase" && (
          <Panel title="Purchase Behaviour">
            <Cell label="First Purchase" value={purchase?.first_purchase_date} />
            <Cell label="Last Purchase" value={purchase?.last_purchase_date} />
            <Cell
              label="Total Orders"
              value={purchase?.total_orders}
              tone="text-info-1"
            />
            <Cell
              label="Total Spend"
              value={formatMoney(Number(purchase?.total_spend ?? 0))}
              tone="text-primary-green-300"
            />
            <Cell
              label="Avg Basket"
              value={formatMoney(Number(purchase?.average_basket_size ?? 0))}
              tone="text-warning-1"
            />
            <Cell
              label="Lifetime Value"
              value={formatMoney(Number(purchase?.lifetime_value ?? 0))}
              tone="text-primary-green-300"
            />
            <Cell
              label="Favourite Category"
              value={purchase?.favourite_category}
            />
            <Cell
              label="Favourite Product"
              value={purchase?.favourite_product}
            />
            <Cell
              label="Preferred Payment"
              value={purchase?.preferred_payment}
            />
            <Cell
              label="Retention Score"
              value={`${purchase?.retention_score ?? 0}/100`}
            />
          </Panel>
        )}

        {tab === "Loyalty" && (
          <Panel title="Loyalty & Rewards">
            <Cell
              label="Loyalty Tier"
              value={loyalty?.loyalty_tier}
              tone="text-violet-600"
            />
            <Cell
              label="Reward Points"
              value={Number(loyalty?.reward_points ?? 0).toLocaleString()}
              tone="text-warning-1"
            />
            <Cell
              label="Reward Balance"
              value={formatMoney(Number(loyalty?.reward_balance ?? 0))}
              tone="text-primary-green-300"
            />
            <Cell
              label="Cashback Earned"
              value={formatMoney(Number(loyalty?.cashback_earned ?? 0))}
              tone="text-primary-green-300"
            />
            <Cell label="Referrals" value={loyalty?.referral_count} />
            <Cell label="Streak" value={loyalty?.streak} />
            <Cell label="Streak Progress" value={loyalty?.streak_progress} />
            <Cell label="Coupons Redeemed" value={loyalty?.coupons_redeemed} />
          </Panel>
        )}

        {tab === "Engagement" && (
          <Panel title="Engagement Metrics">
            <Cell
              label="Churn Risk"
              value={engagement?.churn_risk}
              tone={RISK_TONES[engagement?.churn_risk ?? ""] ?? "text-grey-1"}
            />
            <Cell
              label="Retention Score"
              value={`${engagement?.retention_score ?? 0}/100`}
            />
            <Cell label="Current Streak" value={engagement?.current_streak} />
            <Cell
              label="Coupons Redeemed"
              value={engagement?.coupons_redeemed}
            />
          </Panel>
        )}

        {tab === "Shopping" && (
          <Panel title="Shopping Behaviour">
            <Cell label="Visit Frequency" value={shopping?.visit_frequency} />
            <Cell
              label="Purchase Frequency"
              value={shopping?.purchase_frequency}
            />
            <Cell
              label="Shopping Time"
              value={shopping?.shopping_time}
              tone="text-info-1"
            />
            <Cell
              label="Shopping Day"
              value={shopping?.shopping_day}
              tone="text-primary-green-300"
            />
            <Cell
              label="Preferred Payment"
              value={shopping?.preferred_payment}
            />
          </Panel>
        )}

        {tab === "Financial" && (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Wallet */}
              <div className="rounded-2xl border border-grey-5 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-green-500 text-primary-green-300">
                    <Wallet className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-xs font-bold text-grey-2">Wallet Balance</p>
                </div>
                <p className="text-2xl font-extrabold text-grey-1">
                  {formatMoney(Number(financial?.wallet_balance ?? 0))}
                </p>
                <div className="mt-3 border-t border-grey-6 pt-3">
                  <p className="text-[10px] text-grey-3">Credit Balance</p>
                  <p className="mt-0.5 text-sm font-extrabold text-info-1">
                    {formatMoney(Number(financial?.credit_balance ?? 0))}
                  </p>
                </div>
              </div>

              {/* BNPL — no fields for this in the payload yet. */}
              <div className="rounded-2xl border border-grey-5 bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-info-2 text-info-1">
                    <CreditCard className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-xs font-bold text-grey-2">BNPL Status</p>
                  <DataGapBadge
                    label="No BNPL data"
                    needs="GET /customer/{id}/ — financial_details has no BNPL fields. Needed: bnpl_status (Active/Inactive), credit_limit and avg_repayment_time, which the Financial tab design shows."
                  />
                </div>
                <p className="text-2xl font-extrabold text-grey-4">—</p>
                <div className="mt-3 flex items-center justify-between border-t border-grey-6 pt-3">
                  <div>
                    <p className="text-[10px] text-grey-3">Outstanding</p>
                    <p className="mt-0.5 text-sm font-extrabold text-grey-1">
                      {formatMoney(Number(financial?.outstanding_balance ?? 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-grey-3">Repayment</p>
                    <p className="mt-0.5 text-sm font-extrabold text-grey-4">—</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-grey-5 bg-white p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
                All Financial Details
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Cell
                  label="Wallet Balance"
                  value={formatMoney(Number(financial?.wallet_balance ?? 0))}
                  tone="text-primary-green-300"
                />
                <Cell
                  label="Credit Balance"
                  value={formatMoney(Number(financial?.credit_balance ?? 0))}
                  tone="text-info-1"
                />
                <Cell label="Credit Limit" value={null} />
                <Cell
                  label="Outstanding Balance"
                  value={formatMoney(Number(financial?.outstanding_balance ?? 0))}
                />
                <Cell label="BNPL Usage" value={null} />
                <Cell label="Avg Repayment Time" value={null} />
                <Cell
                  label="Total Lifetime Spend"
                  value={formatMoney(
                    Number(financial?.total_lifetime_spend ?? 0),
                  )}
                  tone="text-primary-green-300"
                />
                <Cell
                  label="Avg Basket Size"
                  value={formatMoney(Number(financial?.avg_basket_size ?? 0))}
                  tone="text-info-1"
                />
                <Cell label="Total Orders" value={financial?.total_orders} />
                <Cell
                  label="Cashback Earned"
                  value={formatMoney(Number(financial?.cashback_earned ?? 0))}
                  tone="text-primary-green-300"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
