import { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { CustomerType } from "./types";

// Every column below is backed by the list endpoint — it returns initials,
// gender, tier_name, points, customer_code, visits, lifetime_value, avg_spend,
// last_visit, risk_level, retention_score, status, wallet_balance and
// credit_balance alongside the base fields. Nothing here is derived or faked.

const AVATAR_TONES = [
  "bg-primary-green-300",
  "bg-emerald-500",
  "bg-teal-600",
  "bg-sky-600",
  "bg-violet-500",
  "bg-amber-500",
];

/** Stable per-customer tint so avatars don't reshuffle between renders. */
const avatarTone = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
};

const TIER_TONES: Record<string, string> = {
  VIP: "bg-violet-100 text-violet-700",
  Gold: "bg-amber-100 text-amber-700",
  Silver: "bg-grey-6 text-grey-3",
  Bronze: "bg-orange-100 text-orange-700",
};

const RISK_TONES: Record<string, string> = {
  Low: "text-primary-green-300",
  Medium: "text-warning-1",
  High: "text-orange-600",
  Critical: "text-error-1",
};

const STATUS_TONES: Record<string, string> = {
  Active: "bg-primary-green-500 text-primary-green-300",
  "At Risk": "bg-warning-2 text-warning-1",
  Inactive: "bg-grey-6 text-grey-3",
};

/** Score bar colour tracks the same thresholds as the risk column. */
const scoreTone = (score: number) =>
  score >= 70
    ? "bg-primary-green-300"
    : score >= 40
      ? "bg-warning-1"
      : "bg-error-1";

const Blank = () => <span className="text-sm text-grey-4">—</span>;

/**
 * Every column the list endpoint can fill. Which of them actually render is
 * decided by LIST_COLUMNS below — keeping the definitions here means putting
 * one back is a one-word edit rather than rewriting a cell.
 */
const COLUMN_DEFS = {
  name: {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white",
              avatarTone(customer.id ?? customer.name ?? ""),
            )}
          >
            {customer.initials ?? "?"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-primary-green-300 truncate">
              {customer.name}
            </p>
            {/* The customer code lives under the name rather than in its own
                column — it is a lookup key, not something anyone scans a list
                by, and it costs no width here. */}
            {customer.customer_code && (
              <p className="text-[10px] font-medium text-grey-4 truncate">
                {customer.customer_code}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  customer_code: {
    accessorKey: "customer_code",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-info-1 whitespace-nowrap">
        {row.original.customer_code ?? "—"}
      </span>
    ),
  },
  phone: {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm text-grey-2 whitespace-nowrap">
        {row.original.phone || "—"}
      </span>
    ),
  },
  gender: {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) =>
      row.original.gender ? (
        <span className="text-sm text-grey-2">{row.original.gender}</span>
      ) : (
        <Blank />
      ),
  },
  location: {
    id: "location",
    header: "State / City",
    cell: ({ row }) => {
      const address =
        row.original.addresses?.find((a) => a.is_default) ??
        row.original.addresses?.[0];
      const parts = [address?.city, address?.state].filter(Boolean);
      return parts.length ? (
        <span className="text-sm text-info-1 whitespace-nowrap">
          {parts.join(", ")}
        </span>
      ) : (
        <Blank />
      );
    },
  },
  tier: {
    accessorKey: "tier_name",
    header: "Tier",
    cell: ({ row }) => {
      const tier = row.original.tier_name;
      if (!tier) return <Blank />;
      return (
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
            TIER_TONES[tier] ?? "bg-grey-6 text-grey-3",
          )}
        >
          {tier}
        </span>
      );
    },
  },
  points: {
    accessorKey: "points",
    header: "Points",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-warning-1">
        {Number(row.original.points ?? 0).toLocaleString()}
      </span>
    ),
  },
  wallet_credit: {
    id: "wallet_credit",
    header: "Wallet / Credit",
    cell: ({ row }) => {
      const wallet = Number(row.original.wallet_balance ?? 0);
      const credit = Number(row.original.credit_balance ?? 0);
      return (
        <div className="whitespace-nowrap">
          <p className="text-sm font-bold text-warning-1">
            {formatToNaira(wallet)}
          </p>
          {credit > 0 && (
            <p className="text-[10px] font-bold text-primary-green-300">
              +{formatToNaira(credit)} credit
            </p>
          )}
        </div>
      );
    },
  },
  orders: {
    accessorKey: "sales_count",
    header: "Orders",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-info-1">
        {Number(row.original.sales_count ?? 0)}
      </span>
    ),
  },
  total_spend: {
    accessorKey: "total_sales",
    header: "Total Spend",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-primary-green-300 whitespace-nowrap">
        {formatToNaira(Number(row.original.total_sales ?? 0))}
      </span>
    ),
  },
  avg_basket: {
    accessorKey: "avg_spend",
    header: "Avg Basket",
    cell: ({ row }) => (
      <span className="text-sm text-primary-green-300 whitespace-nowrap">
        {formatToNaira(Number(row.original.avg_spend ?? 0))}
      </span>
    ),
  },
  lifetime_value: {
    accessorKey: "lifetime_value",
    header: "LTV",
    cell: ({ row }) => (
      <span className="text-sm font-extrabold text-primary-green-300 whitespace-nowrap">
        {formatToNaira(Number(row.original.lifetime_value ?? 0))}
      </span>
    ),
  },
  last_purchase: {
    accessorKey: "last_visit",
    header: "Last Purchase",
    cell: ({ row }) =>
      row.original.last_visit ? (
        <span className="text-sm text-grey-2 whitespace-nowrap">
          {row.original.last_visit}
        </span>
      ) : (
        <Blank />
      ),
  },
  visits: {
    accessorKey: "visits",
    id: "visits_count",
    header: "Visits",
    cell: ({ row }) => (
      <span className="text-sm text-grey-2">
        {Number(row.original.visits ?? 0)}
      </span>
    ),
  },
  risk: {
    accessorKey: "risk_level",
    header: "Risk",
    cell: ({ row }) => {
      const risk = row.original.risk_level;
      if (!risk) return <Blank />;
      return (
        <span
          className={cn(
            "text-xs font-bold whitespace-nowrap",
            RISK_TONES[risk] ?? "text-grey-3",
          )}
        >
          {risk}
        </span>
      );
    },
  },
  retention_score: {
    accessorKey: "retention_score",
    header: "Score",
    cell: ({ row }) => {
      const score = Number(row.original.retention_score ?? 0);
      return (
        <div className="flex items-center gap-2 w-[70px]">
          <div className="h-1.5 flex-1 rounded-full bg-grey-6 overflow-hidden">
            <div
              className={cn("h-full rounded-full", scoreTone(score))}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-grey-2">{score}</span>
        </div>
      );
    },
  },
  status: {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return <Blank />;
      return (
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
            STATUS_TONES[status] ?? "bg-grey-6 text-grey-3",
          )}
        >
          {status}
        </span>
      );
    },
  },
} satisfies Record<string, ColumnDef<CustomerType>>;

/**
 * What the list shows.
 *
 * The table's job is to find a customer and triage them; the profile behind a
 * row click is where the detail lives, so anything the profile already answers
 * is left out rather than duplicated across seventeen columns:
 *
 *  - ID          → shown under the name, and covered by search
 *  - Gender      → profile ▸ Overview ▸ Identity
 *  - State/City  → profile ▸ Overview ▸ Identity
 *  - Points      → profile ▸ Loyalty (Tier already signals standing here)
 *  - Avg Basket  → profile ▸ Purchase, and it is Total Spend ÷ Orders
 *  - LTV         → profile ▸ Purchase; it tracked Total Spend so closely that
 *                  two money columns side by side just raised "which is real?"
 *  - Visits      → dropped outright: it read almost identically to Orders and
 *                  the two were wired to different fields, so the same row
 *                  could show 4 orders and 7 visits with nothing to explain it
 *  - Score       → profile ▸ Purchase; Risk is derived from it and reads faster
 */
const LIST_COLUMNS = [
  "name",
  "phone",
  "tier",
  "wallet_credit",
  "orders",
  "total_spend",
  "last_purchase",
  "risk",
  "status",
] as const satisfies readonly (keyof typeof COLUMN_DEFS)[];

export const columns: ColumnDef<CustomerType>[] = LIST_COLUMNS.map(
  (key) => COLUMN_DEFS[key],
);

// No "View Profile" action column — the whole row is clickable and routes to
// /customers/{id}, which is both the design and one less thing to aim at.
