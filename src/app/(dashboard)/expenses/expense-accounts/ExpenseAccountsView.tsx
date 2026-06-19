"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Eye,
  Plus,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import moment from "moment";
import {
  AccountSpend,
  CategorySpend,
  ExpenseAccount,
  ExpenseTransaction,
  MOCK_ACCOUNTS,
  MOCK_TRANSACTIONS,
  STATUS_META,
  UserSpend,
  computeAccountSpend,
  computeCategorySpend,
  computeTotalBalance,
  computeUserSpend,
  getAccountById,
  getUserById,
} from "./mock-data";

interface ExpenseAccountsViewProps {
  onCreateSubAccount: () => void;
  onTransfer: (sourceId?: string) => void;
  onViewTransaction: (txn: ExpenseTransaction) => void;
  onViewTransactionsTab: () => void;
}

const ExpenseAccountsView = ({
  onCreateSubAccount,
  onTransfer,
  onViewTransaction,
  onViewTransactionsTab,
}: ExpenseAccountsViewProps) => {
  const totalBalance = computeTotalBalance();
  const pendingApprovals = MOCK_TRANSACTIONS.filter(
    (t) => t.status === "PENDING",
  );
  const recentExpenses = MOCK_TRANSACTIONS.filter(
    (t) => t.destinationAccountId === null,
  ).slice(0, 4);
  const recentTransfers = MOCK_TRANSACTIONS.filter(
    (t) => t.destinationAccountId !== null,
  ).slice(0, 4);

  const categorySpend = computeCategorySpend();
  const userSpend = computeUserSpend();
  const accountSpend = computeAccountSpend();

  return (
    <div className="space-y-5">
      {/* Dashboard widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <WidgetCard
          label="Total Balance"
          value={formatToNaira(totalBalance)}
          icon={<Wallet className="w-4 h-4 text-emerald-600" />}
          tone="emerald"
          subtitle={`Across ${MOCK_ACCOUNTS.length} accounts`}
        />
        <WidgetCard
          label="Pending Approvals"
          value={pendingApprovals.length.toString()}
          icon={<Receipt className="w-4 h-4 text-amber-600" />}
          tone="amber"
          subtitle={`${formatToNaira(
            pendingApprovals.reduce((s, t) => s + t.amount, 0),
          )} awaiting`}
        />
        <WidgetCard
          label="Recent Transfers"
          value={recentTransfers.length.toString()}
          icon={<ArrowUpRight className="w-4 h-4 text-sky-600" />}
          tone="sky"
          subtitle="This week"
        />
      </div>

      {/* Account list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Your Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap an account to fund, transfer or view its transaction log.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={onCreateSubAccount}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {MOCK_ACCOUNTS.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onTransfer={() => onTransfer(account.id)}
            />
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentList
          title="Recent Expenses"
          icon={<ArrowDownLeft className="w-4 h-4 text-rose-600" />}
          items={recentExpenses}
          onViewItem={onViewTransaction}
          onViewAll={onViewTransactionsTab}
          emptyLabel="No recent expenses"
        />
        <RecentList
          title="Recent Transfers"
          icon={<ArrowUpRight className="w-4 h-4 text-sky-600" />}
          items={recentTransfers}
          onViewItem={onViewTransaction}
          onViewAll={onViewTransactionsTab}
          emptyLabel="No recent transfers"
        />
      </div>

      {/* Spending breakdown */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Spending Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Who, what and where the money went this month.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <SpendList
            title="By Category"
            data={categorySpend.slice(0, 6).map((c) => ({
              label: c.category,
              amount: c.amount,
            }))}
            tone="emerald"
          />
          <SpendList
            title="By User"
            data={userSpend.slice(0, 6).map((u) => ({
              label: u.user.name,
              sub: u.user.role,
              amount: u.amount,
            }))}
            tone="sky"
          />
          <SpendList
            title="By Account"
            data={accountSpend.slice(0, 6).map((a) => ({
              label: a.account.name,
              sub: a.account.accountNumber,
              amount: a.amount,
            }))}
            tone="violet"
          />
        </div>
      </section>
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
      <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  );
};

// ─── Account card (per sub-account) ─────────────────────────────────────────

const AccountCard = ({
  account,
  onTransfer,
}: {
  account: ExpenseAccount;
  onTransfer: () => void;
}) => {
  const userObjs = account.assignedUsers
    .map((id) => getUserById(id))
    .filter(Boolean);
  const spentPct = account.spendingLimit
    ? Math.min(100, Math.round((account.monthlySpend / account.spendingLimit) * 100))
    : null;

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white p-4 hover:shadow-md transition-shadow",
        account.isMain
          ? "border-emerald-300 ring-1 ring-emerald-200"
          : "border-slate-200",
      )}
    >
      {account.isMain && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
          Main
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            account.isMain
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              : "bg-slate-100 text-slate-700",
          )}
        >
          <Briefcase className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">
            {account.name}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {account.accountNumber}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Balance
          </p>
          <p className="text-base font-bold text-slate-900 mt-0.5">
            {formatToNaira(account.balance)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            This Month
          </p>
          <p className="text-base font-bold text-rose-600 mt-0.5">
            {formatToNaira(account.monthlySpend)}
          </p>
        </div>
      </div>

      {spentPct !== null && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
            <span>Monthly limit</span>
            <span>{spentPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                spentPct > 90
                  ? "bg-rose-500"
                  : spentPct > 70
                    ? "bg-amber-500"
                    : "bg-emerald-500",
              )}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5">
        <Users className="w-3 h-3 text-slate-400" />
        <div className="flex -space-x-1.5">
          {userObjs.slice(0, 3).map((u) => (
            <div
              key={u!.id}
              className="w-5 h-5 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white"
              title={u!.name}
            >
              {u!.initials}
            </div>
          ))}
          {userObjs.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-semibold flex items-center justify-center border-2 border-white">
              +{userObjs.length - 3}
            </div>
          )}
        </div>
        <span className="text-[11px] text-slate-500 ml-auto">
          {userObjs.length} assigned
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-slate-200 text-slate-700"
          onClick={onTransfer}
        >
          <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
          Transfer
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
      </div>
    </div>
  );
};

// ─── Recent activity list ───────────────────────────────────────────────────

const RecentList = ({
  title,
  icon,
  items,
  onViewItem,
  onViewAll,
  emptyLabel,
}: {
  title: string;
  icon: React.ReactNode;
  items: ExpenseTransaction[];
  onViewItem: (txn: ExpenseTransaction) => void;
  onViewAll: () => void;
  emptyLabel: string;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white">
    <div className="flex items-center justify-between p-4 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
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
        {emptyLabel}
      </div>
    ) : (
      <ul className="divide-y divide-slate-100">
        {items.map((t) => {
          const status = STATUS_META[t.status];
          const initiator = getUserById(t.initiatedById);
          return (
            <li key={t.id}>
              <button
                onClick={() => onViewItem(t)}
                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {initiator?.initials || "?"}
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

// ─── Spend list (category / user / account) ─────────────────────────────────

const SpendList = ({
  title,
  data,
  tone,
}: {
  title: string;
  data: Array<{ label: string; sub?: string; amount: number }>;
  tone: "emerald" | "sky" | "violet";
}) => {
  const toneClasses: Record<typeof tone, string> = {
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
  };
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
        {title}
      </p>
      {data.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-6 text-center">
          No data yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((d, i) => {
            const pct = Math.round((d.amount / max) * 100);
            return (
              <li key={i}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {d.label}
                    </p>
                    {d.sub && (
                      <p className="text-[10px] text-slate-500 truncate">
                        {d.sub}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 shrink-0">
                    {formatToNaira(d.amount)}
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", toneClasses[tone])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// Re-export types used by consumers (so the main page doesn't have to import twice).
export type {
  AccountSpend,
  CategorySpend,
  ExpenseAccount,
  ExpenseTransaction,
  UserSpend,
};
export default ExpenseAccountsView;
