"use client";

import { useReferralDashboardQuery } from "@/api/referral/referral";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  AlertTriangle,
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
import { useMemo, useState } from "react";
import {
  STATUS_META,
  buildReferralLink,
  normaliseReferralStatus,
} from "./data";
import WithdrawModal from "./WithdrawModal";

const Referral = () => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);

  const { data, isLoading, isError, refetch } = useReferralDashboardQuery();
  const dashboard = data?.data;

  const referralCode = dashboard?.code || "";
  const referralLink = useMemo(
    () => (referralCode ? buildReferralLink(referralCode) : ""),
    [referralCode],
  );

  const summary = dashboard?.summary;
  const trackingTable = dashboard?.tracking_table ?? [];
  // Pending balance isn't returned directly — derive from pending_rewards so
  // the second wallet card still has something meaningful to display.
  const pendingBalance = summary?.pending_rewards ?? 0;
  const availableBalance = summary?.available_balance ?? 0;

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Couldn't copy the link.", "error");
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    const shareData = {
      title: "Join Sync360",
      text: `Join Sync360 with my referral link and get started in minutes.`,
      url: referralLink,
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
    <div className="w-full flex flex-col gap-4 sm:gap-5">
      {/* Page title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-grey-1">
          Refer & Earn
        </h1>
        <p className="text-sm text-grey-3 mt-1">
          Bring businesses onto Sync360 and earn for every active subscriber.
        </p>
      </div>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-green-100 to-primary-green-300 text-white p-4 sm:p-6">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-8 -bottom-12 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-secondary-3">
              Referral Program
            </p>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold mt-1 leading-tight md:whitespace-nowrap">
              Earn up to ₦20,000 for every business you refer to Sync360
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1.5 md:max-w-none md:whitespace-nowrap">
              Rewards unlock as your referrals subscribe. Withdraw any time you
              hit the available balance.
            </p>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="rounded-xl border border-error-1/20 bg-error-2 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-error-1 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-error-1">
              Couldn't load your referral dashboard
            </p>
            <p className="text-xs text-error-1/80 mt-0.5">
              Check your connection and try again.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-error-1/30 text-error-1 hover:bg-error-2"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard
          title="Total Referrals"
          value={summary ? String(summary.total_referrals) : "—"}
          loading={isLoading}
          icon={<Users className="w-5 h-5 text-info-1" />}
          cardBg="bg-white"
        />
        <SummaryCard
          title="Pending Rewards"
          value={summary ? formatToNaira(summary.pending_rewards) : "—"}
          loading={isLoading}
          icon={<Hourglass className="w-5 h-5 text-warning-1" />}
          cardBg="bg-warning-2"
        />
        <SummaryCard
          title="Total Paid Commission"
          value={summary ? formatToNaira(summary.total_paid_commission) : "—"}
          loading={isLoading}
          icon={<CheckCircle2 className="w-5 h-5 text-success-1" />}
          cardBg="bg-success-2"
        />
      </div>

      {/* Referral link */}
      <div className="rounded-2xl border border-border-tint bg-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <p className="text-sm font-extrabold text-grey-1">
              Your Referral Link
            </p>
            <p className="text-xs text-grey-3 mt-0.5">
              Share this link or your code with a business owner.
            </p>
          </div>
          <span className="text-xs font-bold text-grey-2 bg-grey-6 px-3 py-1.5 rounded-full w-fit">
            {isLoading ? "Loading..." : `Code: ${referralCode || "—"}`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-grey-6 border border-grey-5 rounded-lg px-3 sm:px-4 py-2.5 text-sm font-mono text-grey-2 truncate">
            {isLoading ? (
              <Skeleton className="h-4 w-3/4 bg-grey-5" />
            ) : (
              referralLink || "Sign in to generate your referral link"
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!referralLink}
              className={cn(
                "flex-1 sm:flex-none transition-colors",
                copied &&
                  "bg-success-2 border-success-1/30 text-success-1 hover:bg-success-2",
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
              disabled={!referralLink}
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
        <div className="rounded-2xl border border-border-tint bg-success-2 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Wallet className="w-5 h-5 text-success-1" />
              </div>
              <div>
                <p className="text-xs font-bold text-success-1 uppercase tracking-wider">
                  Available Balance
                </p>
                <p className="text-[11px] text-success-1/70">
                  Ready for withdrawal.
                </p>
              </div>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-40 bg-grey-5" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold text-grey-1">
              {formatToNaira(availableBalance)}
            </p>
          )}
          <Button
            onClick={() => setOpenWithdraw(true)}
            className="mt-4 w-full sm:w-auto"
            disabled={availableBalance <= 0 || isLoading}
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Withdraw Funds
          </Button>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-border-tint bg-warning-2 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-warning-1" />
            </div>
            <div>
              <p className="text-xs font-bold text-warning-1 uppercase tracking-wider">
                Pending Balance
              </p>
              <p className="text-[11px] text-warning-1/70">
                Money still locked.
              </p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-40 bg-grey-5" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold text-grey-1">
              {formatToNaira(pendingBalance)}
            </p>
          )}
          <p className="text-xs text-warning-1/90 mt-3 leading-relaxed">
            Pending rewards unlock as referred businesses subscribe to Sync360
            plans.
          </p>
        </div>
      </div>

      {/* Tracking table */}
      <div className="rounded-2xl border border-border-tint bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-tint">
          <div>
            <p className="text-base font-extrabold text-grey-1">
              Referral Tracking
            </p>
            <p className="text-xs text-grey-3 mt-0.5">
              Tap a business to see its full reward breakdown.
            </p>
          </div>
          <span className="text-xs text-grey-3 hidden sm:inline">
            {trackingTable.length} businesses
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 sm:p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-grey-5" />
            ))}
          </div>
        ) : trackingTable.length === 0 ? (
          <div className="py-10 text-center text-sm text-grey-3">
            No referred businesses yet. Share your link to start earning.
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-grey-6 border-b border-border-tint text-left">
                    <th className="py-2.5 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                      Business
                    </th>
                    <th className="py-2.5 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300">
                      Status
                    </th>
                    <th className="py-2.5 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300 text-right">
                      Pending
                    </th>
                    <th className="py-2.5 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300 text-right">
                      Unlocked
                    </th>
                    <th className="py-2.5 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300 text-right">
                      Expires
                    </th>
                    <th className="py-2.5 px-4 text-xs font-extrabold uppercase tracking-wide text-primary-green-300 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trackingTable.map((b) => {
                    const statusKey = normaliseReferralStatus(b.status);
                    const status = STATUS_META[statusKey];
                    return (
                      <tr
                        key={b.business_id}
                        className="border-b border-border-tint hover:bg-grey-6/60"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/referral/${b.business_id}`}
                            className="text-sm font-bold text-grey-1 hover:text-primary-green-300"
                          >
                            {b.business_name}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full",
                              status.pillClass,
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                status.dotClass,
                              )}
                            />
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-warning-1 font-bold text-right">
                          {formatToNaira(b.pending)}
                        </td>
                        <td className="py-3 px-4 text-sm text-success-1 font-bold text-right">
                          {formatToNaira(b.unlocked)}
                        </td>
                        <td className="py-3 px-4 text-sm text-grey-3 text-right whitespace-nowrap">
                          {b.expires_days > 0
                            ? `${b.expires_days} days`
                            : "Expired"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/referral/${b.business_id}`}
                            className="inline-flex items-center text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80"
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
            <ul className="sm:hidden divide-y divide-border-tint">
              {trackingTable.map((b) => {
                const statusKey = normaliseReferralStatus(b.status);
                const status = STATUS_META[statusKey];
                return (
                  <li key={b.business_id}>
                    <Link
                      href={`/referral/${b.business_id}`}
                      className="flex items-center gap-3 p-4 active:bg-grey-6"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-grey-1 truncate">
                            {b.business_name}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full",
                              status.pillClass,
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                status.dotClass,
                              )}
                            />
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-xs">
                          <span className="text-warning-1 font-medium">
                            Pending {formatToNaira(b.pending)}
                          </span>
                          <span className="text-success-1 font-medium">
                            Unlocked {formatToNaira(b.unlocked)}
                          </span>
                        </div>
                        <p className="text-[11px] text-grey-4 mt-1">
                          {b.expires_days > 0
                            ? `${b.expires_days} days left`
                            : "Expired"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-grey-4 shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <WithdrawModal
        isOpen={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        availableBalance={availableBalance}
      />
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  loading?: boolean;
  icon: React.ReactNode;
  cardBg: string;
}
const SummaryCard = ({
  title,
  value,
  loading,
  icon,
  cardBg,
}: SummaryCardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-border-tint p-4 sm:p-5",
      cardBg,
    )}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-grey-2">{title}</p>
        {loading ? (
          <Skeleton className="h-6 w-24 mt-1 bg-grey-5" />
        ) : (
          <p className="text-xl sm:text-2xl font-extrabold text-grey-1 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default Referral;
