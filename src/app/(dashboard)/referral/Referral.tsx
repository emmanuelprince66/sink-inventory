"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  Gift,
  Hourglass,
  Share2,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  REFERRAL_BUSINESSES,
  REFERRAL_SUMMARY,
  STATUS_META,
} from "./data";
import WithdrawModal from "./WithdrawModal";

const Referral = () => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_SUMMARY.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Couldn't copy the link.", "error");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Join Sync360",
      text: `Join Sync360 with my referral link and get started in minutes.`,
      url: REFERRAL_SUMMARY.referralLink,
    };
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
      } catch {
        /* user cancelled — no-op */
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 p-4 md:p-6 bg-gray-50">
      {/* Page title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Refer & Earn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bring businesses onto Sync360 and earn for every active subscriber.
        </p>
      </div>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white p-5 sm:p-8">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-12 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider opacity-90">
              Referral Program
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 leading-tight">
              Earn up to ₦20,000 for every business you refer to Sync360
            </h2>
            <p className="text-xs sm:text-sm opacity-90 mt-2 max-w-xl">
              Rewards unlock as your referrals subscribe. Withdraw any time you
              hit the available balance.
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard
          title="Total Referrals"
          value={REFERRAL_SUMMARY.totalReferrals.toString()}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <SummaryCard
          title="Pending Rewards"
          value={formatToNaira(REFERRAL_SUMMARY.pendingRewards)}
          icon={<Hourglass className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <SummaryCard
          title="Total Paid Commission"
          value={formatToNaira(REFERRAL_SUMMARY.totalPaidCommission)}
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-50"
        />
      </div>

      {/* Referral link */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Your Referral Link
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Share this link or your code with a business owner.
            </p>
          </div>
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
            Code: {REFERRAL_SUMMARY.referralCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 text-sm font-mono text-gray-700 truncate">
            {REFERRAL_SUMMARY.referralLink}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className={cn(
                "flex-1 sm:flex-none transition-colors",
                copied &&
                  "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
              )}
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
              ) : (
                <Copy className="w-4 h-4 mr-1.5" />
              )}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1 sm:flex-none"
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Available */}
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-700 uppercase tracking-wider">
                  Available Balance
                </p>
                <p className="text-[11px] text-emerald-700/70">
                  Ready for withdrawal.
                </p>
              </div>
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-emerald-900">
            {formatToNaira(REFERRAL_SUMMARY.availableBalance)}
          </p>
          <Button
            onClick={() => setOpenWithdraw(true)}
            className="mt-4 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={REFERRAL_SUMMARY.availableBalance <= 0}
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Withdraw Funds
          </Button>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/60 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-700 uppercase tracking-wider">
                Pending Balance
              </p>
              <p className="text-[11px] text-amber-700/70">
                Money still locked.
              </p>
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-amber-900">
            {formatToNaira(REFERRAL_SUMMARY.pendingBalance)}
          </p>
          <p className="text-xs text-amber-800/80 mt-3 leading-relaxed">
            Pending rewards unlock as referred businesses subscribe to Sync360
            plans.
          </p>
        </div>
      </div>

      {/* Tracking table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <div>
            <p className="text-base font-semibold text-gray-900">
              Referral Tracking
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Tap a business to see its full reward breakdown.
            </p>
          </div>
          <span className="text-xs text-gray-500 hidden sm:inline">
            {REFERRAL_BUSINESSES.length} businesses
          </span>
        </div>

        {/* Desktop / tablet table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600">
                  Business
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600">
                  Status
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Pending
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Unlocked
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Expires
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {REFERRAL_BUSINESSES.map((b) => {
                const status = STATUS_META[b.status];
                return (
                  <tr
                    key={b.id}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/referral/${b.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-emerald-700"
                      >
                        {b.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full",
                          status.pillClass,
                        )}
                      >
                        <span
                          className={cn("w-1.5 h-1.5 rounded-full", status.dotClass)}
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-amber-700 font-medium text-right">
                      {formatToNaira(b.pending)}
                    </td>
                    <td className="py-3 px-4 text-sm text-emerald-700 font-medium text-right">
                      {formatToNaira(b.unlocked)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right whitespace-nowrap">
                      {b.expiresInDays > 0 ? `${b.expiresInDays} days` : "Expired"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/referral/${b.id}`}
                        className="inline-flex items-center text-xs font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        View more
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <ul className="sm:hidden divide-y divide-gray-100">
          {REFERRAL_BUSINESSES.map((b) => {
            const status = STATUS_META[b.status];
            return (
              <li key={b.id}>
                <Link
                  href={`/referral/${b.id}`}
                  className="flex items-center gap-3 p-4 active:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {b.name}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full",
                          status.pillClass,
                        )}
                      >
                        <span
                          className={cn("w-1.5 h-1.5 rounded-full", status.dotClass)}
                        />
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs">
                      <span className="text-amber-700">
                        Pending {formatToNaira(b.pending)}
                      </span>
                      <span className="text-emerald-700">
                        Unlocked {formatToNaira(b.unlocked)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {b.expiresInDays > 0
                        ? `${b.expiresInDays} days left`
                        : "Expired"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <WithdrawModal
        isOpen={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        availableBalance={REFERRAL_SUMMARY.availableBalance}
      />
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}
const SummaryCard = ({ title, value, icon, iconBg }: SummaryCardProps) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default Referral;
