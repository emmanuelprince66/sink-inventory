"use client";

import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Hourglass,
  Wallet,
} from "lucide-react";
import moment from "moment";
import {
  CategoryStats,
  EXPENSE_ACCOUNT,
  ExpenseTransaction,
  MOCK_TRANSACTIONS,
  STATUS_META,
  UserSpend,
  computeCategoryStats,
  computeUserSpend,
  getCategoryMeta,
  getUserById,
} from "./mock-data";

interface ExpenseAccountsViewProps {
  onTransfer: (defaultCategory?: string) => void;
  onViewTransaction: (txn: ExpenseTransaction) => void;
  onViewTransactionsTab: (categoryFilter?: string) => void;
  /** Open the detail modal showing budget + transactions for a category. */
  onViewCategory: (stats: CategoryStats) => void;
}

const ExpenseAccountsView = ({
  onTransfer,
  onViewTransaction,
  onViewTransactionsTab,
  onViewCategory,
}: ExpenseAccountsViewProps) => {
  const pendingApprovals = MOCK_TRANSACTIONS.filter(
    (t) => t.status === "PENDING",
  );
  const recentActivity = [...MOCK_TRANSACTIONS]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  const categoryStats = computeCategoryStats();
  const userSpend = computeUserSpend();

  const totalCategorisedSpend = categoryStats.reduce(
    (sum, c) => sum + c.total,
    0,
  );

  return (
    <div className="space-y-5">
      {/* Dashboard widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <WidgetCard
          label="Account Balance"
          value={formatToNaira(EXPENSE_ACCOUNT.balance)}
          icon={<Wallet className="w-4 h-4 text-emerald-600" />}
          tone="emerald"
          subtitle={EXPENSE_ACCOUNT.accountNumber}
        />
        <WidgetCard
          label="Pending Approvals"
          value={pendingApprovals.length.toString()}
          icon={<Hourglass className="w-4 h-4 text-amber-600" />}
          tone="amber"
          subtitle={`${formatToNaira(
            pendingApprovals.reduce((s, t) => s + t.amount, 0),
          )} awaiting`}
        />
        <WidgetCard
          label="Spent This Month"
          value={formatToNaira(totalCategorisedSpend)}
          icon={<Activity className="w-4 h-4 text-sky-600" />}
          tone="sky"
          subtitle={`Across ${categoryStats.filter((c) => c.total > 0).length} categories`}
        />
      </div>

      {/* Spend by Category */}
      <section>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Spend by Category
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap a category to view its transactions or transfer money against
              it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map((c) => (
            <CategoryCard
              key={c.category}
              stats={c}
              onViewMore={() => onViewCategory(c)}
              onTransfer={() => onTransfer(c.category)}
            />
          ))}
        </div>
      </section>

      {/* Recent activity + spending breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentActivity
          items={recentActivity}
          onViewItem={onViewTransaction}
          onViewAll={() => onViewTransactionsTab()}
        />
        <SpendByUser data={userSpend} />
      </div>
    </div>
  );
};

// ─── Widget card ────────────────────────────────────────────────────────────

const WidgetCard = ({
  label,
  value,
  subtitle,
  icon,
  tone,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "emerald" | "amber" | "sky";
}) => {
  const toneClasses: Record<typeof tone, string> = {
    emerald: "from-emerald-50 to-white border-emerald-100",
    amber: "from-amber-50 to-white border-amber-100",
    sky: "from-sky-50 to-white border-sky-100",
  };
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-3 sm:p-4",
        toneClasses[tone],
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </p>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
        {value}
      </p>
      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{subtitle}</p>
    </div>
  );
};

// ─── Category card ──────────────────────────────────────────────────────────

const CategoryCard = ({
  stats,
  onViewMore,
  onTransfer,
}: {
  stats: CategoryStats;
  onViewMore: () => void;
  onTransfer: () => void;
}) => {
  const meta = getCategoryMeta(stats.category);
  const Icon = meta.icon;
  const hasBudget = Boolean(stats.budget);
  const pct = stats.spentPct ?? 0;
  const progressTone =
    pct >= 100
      ? "bg-rose-500"
      : pct >= 80
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center border shrink-0",
              meta.tone,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">
              {stats.category}
            </p>
            {hasBudget ? (
              <p className="text-[11px] text-slate-500 mt-0.5">
                {stats.budget!.durationMonths}-month budget · ~
                {formatToNaira(stats.monthlyBudget || 0)}/mo
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-0.5">
                No budget set
              </p>
            )}
          </div>
        </div>

        {/* Spent / Budget */}
        <div className="flex items-baseline gap-1.5">
          <p className="text-xl font-bold text-slate-900">
            {formatToNaira(stats.total)}
          </p>
          {hasBudget && (
            <p className="text-xs text-slate-500">
              of {formatToNaira(stats.budget!.budget)}
            </p>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {stats.count} {stats.count === 1 ? "transaction" : "transactions"}
        </p>

        {/* Progress bar (only when budgeted) */}
        {hasBudget && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500">Budget used</span>
              <span
                className={cn(
                  "font-semibold",
                  pct >= 100
                    ? "text-rose-600"
                    : pct >= 80
                      ? "text-amber-600"
                      : "text-emerald-700",
                )}
              >
                {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progressTone,
                )}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
        <button
          type="button"
          onClick={onTransfer}
          className="text-[11px] font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1 py-2.5 transition-colors"
        >
          <ArrowUpRight className="w-3 h-3" />
          Transfer
        </button>
        <button
          type="button"
          onClick={onViewMore}
          className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1 py-2.5 transition-colors"
        >
          View more
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ─── Recent activity ────────────────────────────────────────────────────────

const RecentActivity = ({
  items,
  onViewItem,
  onViewAll,
}: {
  items: ExpenseTransaction[];
  onViewItem: (txn: ExpenseTransaction) => void;
  onViewAll: () => void;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white">
    <div className="flex items-center justify-between p-4 border-b border-slate-100">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">
          Recent Activity
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Last transfers and logged expenses.
        </p>
      </div>
      <button
        onClick={onViewAll}
        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
      >
        View all
      </button>
    </div>
    {items.length === 0 ? (
      <div className="py-10 text-center text-xs text-slate-500">
        No transactions yet
      </div>
    ) : (
      <ul className="divide-y divide-slate-100">
        {items.map((t) => {
          const status = STATUS_META[t.status];
          const meta = getCategoryMeta(t.category);
          const Icon = meta.icon;
          const initiator = getUserById(t.initiatedById);
          return (
            <li key={t.id}>
              <button
                onClick={() => onViewItem(t)}
                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-md flex items-center justify-center border shrink-0",
                    meta.tone,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {t.category}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                        status.pill,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {t.narration}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    by {initiator?.name || "Unknown"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-900">
                    {formatToNaira(t.amount)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {moment(t.createdAt).fromNow()}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

// ─── Spend by user list ─────────────────────────────────────────────────────

const SpendByUser = ({ data }: { data: UserSpend[] }) => {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="p-4 border-b border-slate-100">
        <h4 className="text-sm font-semibold text-slate-900">Spend by User</h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Who initiated outgoing money this month.
        </p>
      </div>
      <div className="p-4">
        {data.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            No data yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.map((d) => {
              const pct = Math.round((d.amount / max) * 100);
              return (
                <li key={d.user.id}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {d.user.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {d.user.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {d.user.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 shrink-0">
                      {formatToNaira(d.amount)}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpenseAccountsView;
