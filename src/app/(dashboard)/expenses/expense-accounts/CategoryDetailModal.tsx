"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowUpRight,
  CalendarRange,
  ChevronRight,
  Paperclip,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import moment from "moment";
import {
  CategoryStats,
  ExpenseTransaction,
  STATUS_META,
  getCategoryMeta,
  getCategoryTransactions,
  getUserById,
} from "./mock-data";

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The currently-focused category. */
  stats: CategoryStats | null;
  onTransfer: (category: string) => void;
  onSetBudget: (category: string) => void;
  onViewTransaction: (txn: ExpenseTransaction) => void;
}

const CategoryDetailModal = ({
  isOpen,
  onClose,
  stats,
  onTransfer,
  onSetBudget,
  onViewTransaction,
}: CategoryDetailModalProps) => {
  if (!stats) return null;

  const meta = getCategoryMeta(stats.category);
  const Icon = meta.icon;
  const hasBudget = Boolean(stats.budget);
  const transactions = getCategoryTransactions(stats.category);

  const pct = stats.spentPct ?? 0;
  const progressTone =
    pct >= 100
      ? "bg-rose-500"
      : pct >= 80
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={stats.category}
      description={
        hasBudget
          ? `Budget envelope · ${stats.budget!.durationMonths}-month window`
          : "No budget set yet — set one to track spend against a target."
      }
      size="xl"
      headerIcon={
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center border",
            meta.tone,
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={() => onSetBudget(stats.category)}
          >
            <PiggyBank className="w-4 h-4 mr-1.5" />
            {hasBudget ? "Edit budget" : "Set budget"}
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onTransfer(stats.category)}
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Transfer under {stats.category}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            label="Budget"
            value={hasBudget ? formatToNaira(stats.budget!.budget) : "—"}
            icon={<PiggyBank className="w-3.5 h-3.5" />}
            tone="emerald"
          />
          <StatTile
            label="Spent"
            value={formatToNaira(stats.total)}
            icon={<TrendingDown className="w-3.5 h-3.5" />}
            tone="rose"
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
                ? `${stats.budget!.durationMonths}-month plan`
                : undefined
            }
          />
        </div>

        {/* Progress bar (only when there's a budget) */}
        {hasBudget && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Budget used
                </p>
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
                className={cn(
                  "h-full rounded-full transition-all",
                  progressTone,
                )}
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
          </div>
        )}

        {/* Transactions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Transactions
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every {stats.category.toLowerCase()} expense recorded against
                the expense account.
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              {transactions.length}{" "}
              {transactions.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 px-4 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No transactions yet
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Transfers under {stats.category} will show up here.
              </p>
            </div>
          ) : (
            <ul className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
              {transactions.map((t) => {
                const status = STATUS_META[t.status];
                const initiator = getUserById(t.initiatedById);
                const approver = t.approvedById
                  ? getUserById(t.approvedById)
                  : null;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => onViewTransaction(t)}
                      className="w-full p-3 sm:p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
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
                              status.pill,
                            )}
                          >
                            {status.label}
                          </span>
                          {t.attachments.length > 0 && (
                            <Paperclip className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {t.narration}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          by {initiator?.name || "Unknown"}
                          {approver && ` · approved by ${approver.name}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">
                          {formatToNaira(t.amount)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {moment(t.createdAt).format("MMM D")}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </CustomModal>
  );
};

// ─── Stat tile ──────────────────────────────────────────────────────────────

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
        "rounded-xl border bg-gradient-to-br p-3",
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
      <p className="text-base sm:text-lg font-bold text-slate-900 mt-2 truncate">
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
      )}
    </div>
  );
};

export default CategoryDetailModal;
