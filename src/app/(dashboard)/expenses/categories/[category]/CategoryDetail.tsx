"use client";

import CustomPagination from "@/components/app/CustomPagination";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarRange,
  ChevronRight,
  FilterX,
  Inbox,
  Paperclip,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import SetCategoryBudgetModal from "../../expense-accounts/SetCategoryBudgetModal";
import TransactionDetailsModal from "../../expense-accounts/TransactionDetailsModal";
import TransferMoneyModal from "../../expense-accounts/TransferMoneyModal";
import {
  CATEGORY_BUDGETS,
  ExpenseTransaction,
  MOCK_USERS,
  STATUS_META,
  TransactionStatus,
  computeCategoryBudgetStats,
  getCategoryMeta,
  getCategoryTransactions,
  getUserById,
} from "../../expense-accounts/mock-data";

interface CategoryDetailProps {
  categoryParam: string;
}

type MonthPreset = "this" | "last" | "3m" | "6m" | "ytd" | "custom";
const ALL = "__all__";
const PAGE_SIZE = 10;

const monthPresetToRange = (preset: MonthPreset): DateRange | undefined => {
  const now = new Date();
  switch (preset) {
    case "this":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: now,
      };
    case "last": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: start, to: end };
    }
    case "3m":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        to: now,
      };
    case "6m":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        to: now,
      };
    case "ytd":
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case "custom":
    default:
      return undefined;
  }
};

const CategoryDetail = ({ categoryParam }: CategoryDetailProps) => {
  const router = useRouter();
  const category = decodeURIComponent(categoryParam);

  // Pull stats fresh on each render — re-runs when budget mutations land.
  const stats = computeCategoryBudgetStats(category);
  const meta = getCategoryMeta(category);
  const CatIcon = meta.icon;
  const hasBudget = Boolean(stats.budget);

  // Filters
  const [preset, setPreset] = useState<MonthPreset>("3m");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    monthPresetToRange("3m"),
  );
  const [userId, setUserId] = useState<string>(ALL);
  const [status, setStatus] = useState<TransactionStatus | typeof ALL>(ALL);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [openBudgetEdit, setOpenBudgetEdit] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [selectedTxn, setSelectedTxn] =
    useState<ExpenseTransaction | null>(null);

  const handlePresetClick = (key: MonthPreset) => {
    setPreset(key);
    if (key !== "custom") {
      setDateRange(monthPresetToRange(key));
    }
    setPage(1);
  };

  const allCategoryTxns = useMemo(
    () => getCategoryTransactions(category),
    [category],
  );

  const filtered = useMemo(() => {
    return allCategoryTxns.filter((t) => {
      // Date range
      if (dateRange?.from || dateRange?.to) {
        const created = new Date(t.createdAt);
        if (dateRange.from && created < startOfDay(dateRange.from)) return false;
        if (dateRange.to && created > endOfDay(dateRange.to)) return false;
      }
      if (userId !== ALL && t.initiatedById !== userId) return false;
      if (status !== ALL && t.status !== status) return false;
      if (search.trim().length >= 2) {
        const q = search.toLowerCase();
        const matches =
          t.reference.toLowerCase().includes(q) ||
          t.narration.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allCategoryTxns, dateRange, userId, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filteredTotal = filtered.reduce((s, t) => s + t.amount, 0);

  const filtersActive =
    preset !== "3m" ||
    userId !== ALL ||
    status !== ALL ||
    !!search.trim();

  const resetFilters = () => {
    setPreset("3m");
    setDateRange(monthPresetToRange("3m"));
    setUserId(ALL);
    setStatus(ALL);
    setSearch("");
    setPage(1);
  };

  const pct = stats.spentPct ?? 0;
  const progressTone =
    pct >= 100
      ? "bg-rose-500"
      : pct >= 80
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="w-full h-full flex flex-col gap-5 pb-12">
      {/* Header — back + title + actions */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center border shrink-0",
              meta.tone,
            )}
          >
            <CatIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link
                href="/expenses"
                className="hover:text-slate-700 truncate"
              >
                Expenses
              </Link>
              <span>·</span>
              <span className="truncate">Categories</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {category}
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={() => setOpenBudgetEdit(true)}
          >
            <PiggyBank className="w-4 h-4 mr-1.5" />
            {hasBudget ? "Edit budget" : "Set budget"}
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setOpenTransfer(true)}
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Transfer under {category}
          </Button>
        </div>
      </header>

      {/* Budget summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Budget"
          value={hasBudget ? formatToNaira(stats.budget!.budget) : "—"}
          icon={<PiggyBank className="w-3.5 h-3.5" />}
          tone="emerald"
          subtitle={
            hasBudget
              ? `${stats.budget!.durationMonths}-month plan`
              : "No budget set"
          }
        />
        <StatTile
          label="Spent"
          value={formatToNaira(stats.total)}
          icon={<TrendingDown className="w-3.5 h-3.5" />}
          tone="rose"
          subtitle={`${stats.count} ${stats.count === 1 ? "transaction" : "transactions"}`}
        />
        <StatTile
          label="Remaining"
          value={hasBudget ? formatToNaira(stats.remaining!) : "—"}
          icon={<Wallet className="w-3.5 h-3.5" />}
          tone="sky"
        />
        <StatTile
          label="Monthly Target"
          value={
            hasBudget && stats.monthlyBudget
              ? formatToNaira(stats.monthlyBudget)
              : "—"
          }
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          tone="violet"
          subtitle={
            hasBudget
              ? `Auto-calculated`
              : "Set a budget to derive this"
          }
        />
      </section>

      {/* Progress strip */}
      {hasBudget && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Budget used</p>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                <CalendarRange className="w-3 h-3" />
                {formatToNaira(stats.total)} of{" "}
                {formatToNaira(stats.budget!.budget)} over{" "}
                {stats.budget!.durationMonths} months
              </p>
            </div>
            <span
              className={cn(
                "text-sm font-bold",
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
          <div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progressTone)}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          {pct >= 100 && (
            <p className="text-[11px] text-rose-600 mt-2">
              Budget exhausted. Consider raising the cap or pausing spend.
            </p>
          )}
          {pct >= 80 && pct < 100 && (
            <p className="text-[11px] text-amber-600 mt-2">
              Approaching the budget cap — review remaining commitments.
            </p>
          )}
        </section>
      )}

      {/* Transactions card */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Filters header */}
        <div className="p-3 sm:p-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Transactions
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every {category.toLowerCase()} expense across the period below.
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}{" "}
              · {formatToNaira(filteredTotal)}
            </span>
          </div>

          {/* Month presets */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <PresetChip
              active={preset === "this"}
              onClick={() => handlePresetClick("this")}
            >
              This month
            </PresetChip>
            <PresetChip
              active={preset === "last"}
              onClick={() => handlePresetClick("last")}
            >
              Last month
            </PresetChip>
            <PresetChip
              active={preset === "3m"}
              onClick={() => handlePresetClick("3m")}
            >
              Last 3 months
            </PresetChip>
            <PresetChip
              active={preset === "6m"}
              onClick={() => handlePresetClick("6m")}
            >
              Last 6 months
            </PresetChip>
            <PresetChip
              active={preset === "ytd"}
              onClick={() => handlePresetClick("ytd")}
            >
              Year to date
            </PresetChip>
            <PresetChip
              active={preset === "custom"}
              onClick={() => handlePresetClick("custom")}
            >
              Custom
            </PresetChip>
          </div>

          {/* Filter row */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <div className="flex-1 min-w-0">
              <SearchInput
                placeholder="Search reference or narration..."
                value={search}
                onValueChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
              />
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-3">
              <div className="md:w-[230px]">
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={(r) => {
                    setDateRange(r);
                    setPreset("custom");
                    setPage(1);
                  }}
                  className="w-full"
                />
              </div>
              <Select
                value={userId}
                onValueChange={(v) => {
                  setUserId(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="md:w-[160px]">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All users</SelectItem>
                  {MOCK_USERS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as TransactionStatus | typeof ALL);
                  setPage(1);
                }}
              >
                <SelectTrigger className="md:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtersActive && (
            <div className="mt-3 flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-slate-600 hover:bg-slate-100"
              >
                <FilterX className="w-3 h-3 mr-1" />
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left">
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Reference
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Date
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Initiated By
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Approved By
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600">
                  Status
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-slate-600 text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t) => {
                const statusMeta = STATUS_META[t.status];
                const initiator = getUserById(t.initiatedById);
                const approver = t.approvedById
                  ? getUserById(t.approvedById)
                  : null;
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTxn(t)}
                    className="border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {t.reference}
                        </span>
                        {t.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[300px] mt-0.5">
                        {t.narration}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 whitespace-nowrap">
                      {moment(t.createdAt).format("MMM D, YYYY")}
                      <p className="text-[10px] text-slate-500">
                        {moment(t.createdAt).format("h:mm A")}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {initiator?.initials || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-900 truncate">
                            {initiator?.name || "—"}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {initiator?.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {approver?.name || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          statusMeta.pill,
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            statusMeta.dot,
                          )}
                        />
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 text-right whitespace-nowrap">
                      {formatToNaira(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="md:hidden divide-y divide-slate-100">
          {pageItems.map((t) => {
            const statusMeta = STATUS_META[t.status];
            const initiator = getUserById(t.initiatedById);
            return (
              <li key={t.id}>
                <button
                  onClick={() => setSelectedTxn(t)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {initiator?.initials || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {t.reference}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                          statusMeta.pill,
                        )}
                      >
                        {statusMeta.label}
                      </span>
                      {t.attachments.length > 0 && (
                        <Paperclip className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {t.narration}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {moment(t.createdAt).format("MMM D, YYYY · h:mm A")} ·{" "}
                      {initiator?.name || "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      {formatToNaira(t.amount)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>

        {pageItems.length === 0 && (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              No transactions found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {filtersActive
                ? "Try widening the date range or clearing the filters."
                : `No ${category.toLowerCase()} expenses recorded yet.`}
            </p>
          </div>
        )}

        {pageItems.length > 0 && (
          <div className="px-3 py-2 border-t border-slate-100">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      {/* Modals */}
      <SetCategoryBudgetModal
        isOpen={openBudgetEdit}
        onClose={() => setOpenBudgetEdit(false)}
        category={category}
        current={CATEGORY_BUDGETS[category]}
      />
      <TransferMoneyModal
        isOpen={openTransfer}
        onClose={() => setOpenTransfer(false)}
        defaultCategory={category}
      />
      <TransactionDetailsModal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        transaction={selectedTxn}
        onApprove={() => setSelectedTxn(null)}
        onReject={() => setSelectedTxn(null)}
      />
    </div>
  );
};

// ─── helpers ────────────────────────────────────────────────────────────────

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};
const endOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
};

// ─── building blocks ────────────────────────────────────────────────────────

const StatTile = ({
  label,
  value,
  icon,
  tone,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "emerald" | "rose" | "sky" | "violet";
  subtitle?: string;
}) => {
  const toneMap: Record<typeof tone, { card: string; iconBg: string }> = {
    emerald: {
      card: "from-emerald-50 to-white border-emerald-100",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    rose: {
      card: "from-rose-50 to-white border-rose-100",
      iconBg: "bg-rose-100 text-rose-700",
    },
    sky: {
      card: "from-sky-50 to-white border-sky-100",
      iconBg: "bg-sky-100 text-sky-700",
    },
    violet: {
      card: "from-violet-50 to-white border-violet-100",
      iconBg: "bg-violet-100 text-violet-700",
    },
  };
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-3 sm:p-4",
        toneMap[tone].card,
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
            toneMap[tone].iconBg,
          )}
        >
          {icon}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </p>
      </div>
      <p className="text-lg sm:text-xl font-bold text-slate-900 mt-2 truncate">
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
      )}
    </div>
  );
};

const PresetChip = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors",
      active
        ? "bg-emerald-600 border-emerald-600 text-white"
        : "bg-white border-slate-200 text-slate-700 hover:border-emerald-200",
    )}
  >
    {children}
  </button>
);

export default CategoryDetail;
