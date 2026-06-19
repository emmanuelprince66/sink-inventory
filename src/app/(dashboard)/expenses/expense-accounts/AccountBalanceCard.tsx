"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowUpRight, Plus, Wallet } from "lucide-react";

interface AccountBalanceCardProps {
  totalBalance: number;
  accountCount: number;
  pendingApprovals: number;
  onCreateSubAccount: () => void;
  onTransfer: () => void;
  className?: string;
}

const AccountBalanceCard = ({
  totalBalance,
  accountCount,
  pendingApprovals,
  onCreateSubAccount,
  onTransfer,
  className,
}: AccountBalanceCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-5 hover:shadow-md transition-shadow",
        className,
      )}
    >
      {/* Decorative blurred orbs */}
      <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-12 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col gap-4 sm:gap-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Expense Account Balance
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Across {accountCount}{" "}
                {accountCount === 1 ? "account" : "accounts"}
              </p>
            </div>
          </div>

          {pendingApprovals > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {pendingApprovals} pending
            </div>
          )}
        </div>

        {/* Balance */}
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {formatToNaira(totalBalance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Funds available for operational spending
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onCreateSubAccount}
            variant="outline"
            className="flex-1 border-emerald-200 bg-white/70 hover:bg-white text-emerald-700 hover:text-emerald-800"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Sub-Account
          </Button>
          <Button
            onClick={onTransfer}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Transfer Money
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountBalanceCard;
