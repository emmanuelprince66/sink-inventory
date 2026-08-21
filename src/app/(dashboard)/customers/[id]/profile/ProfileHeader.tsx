"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, Gift, MessageSquare, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  RISK_TONES,
  StatTile,
  TABS,
  TIER_TONES,
  compact,
  type ProfileTab,
} from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const ProfileHeader = ({
  profile,
}: {
  profile: CustomerProfileData;
}) => {
  const router = useRouter();
  const { identity, purchase, loyalty, financial, row, risk, tier, symbol, tab, setTab } =
    profile;

  const location = [identity?.city, identity?.state].filter(Boolean).join(", ");

  // Figures come from purchase_behaviour / financial_details, which carry the
  // real totals; the nested list row can read 0.
  const tiles = [
    {
      value: compact(Number(purchase?.lifetime_value ?? 0), symbol),
      label: "Lifetime Value",
      tone: "text-primary-green-300",
    },
    {
      value: String(purchase?.total_orders ?? 0),
      label: "Total Orders",
      tone: "text-info-1",
    },
    {
      value: compact(Number(purchase?.average_basket_size ?? 0), symbol),
      label: "Avg Basket",
      tone: "text-warning-1",
    },
    {
      value: compact(Number(purchase?.total_spend ?? 0), symbol),
      label: "Total Spend",
      tone: "text-primary-green-300",
    },
    {
      value: Number(loyalty?.reward_points ?? 0).toLocaleString(),
      label: "Points",
      tone: "text-warning-1",
    },
    {
      value: compact(
        Number(financial?.wallet_balance ?? 0) +
          Number(financial?.credit_balance ?? 0),
        symbol,
      ),
      label: "Wallet + Credit",
      tone: "text-primary-green-300",
    },
    {
      value: `${Number(purchase?.retention_score ?? 0)}/100`,
      label: "Score",
      tone: "text-white",
    },
  ];

  return (
    <div className="rounded-2xl bg-primary-green-100 p-4 sm:p-5">
      {/* Mobile: the back link takes its own row and the three actions share
          the next one at equal width. From sm they sit on one line. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Goes back rather than pushing /customers, so the list keeps the
            search, filters and page the user came from. Falls back to the
            list when this page was opened directly. */}
        <button
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/customers");
          }}
          className="flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Customers
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 flex-1 gap-1.5 rounded-lg border-white/20 bg-transparent text-xs font-bold text-white hover:bg-white/10 hover:text-white sm:h-8 sm:flex-none"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 flex-1 gap-1.5 rounded-lg border-white/20 bg-transparent text-xs font-bold text-white hover:bg-white/10 hover:text-white sm:h-8 sm:flex-none"
          >
            <Gift className="h-3.5 w-3.5" />
            Reward
          </Button>
          <Button
            size="sm"
            className="h-9 flex-1 gap-1.5 rounded-lg text-xs font-bold sm:h-8 sm:flex-none"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* The churn tile drops below the name on mobile rather than squeezing
          it — a long name and a right-aligned tile don't fit at 360px. */}
      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="flex w-full min-w-0 items-start gap-3 sm:w-auto">
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

        <div className="flex w-full shrink-0 items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 sm:w-auto sm:block sm:text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
            Churn Risk
          </p>
          <p
            className={cn(
              "text-sm font-extrabold sm:mt-0.5",
              RISK_TONES[risk] ?? "text-white",
            )}
          >
            {risk}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>

      <div className="mt-4 flex gap-5 overflow-x-auto border-t border-white/10 pt-3 scrollbar-hide">
        {TABS.map((t: ProfileTab) => (
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
  );
};

export default ProfileHeader;
