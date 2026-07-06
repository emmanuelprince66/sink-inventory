"use client";

import { useReferralBusinessQuery } from "@/api/referral/referral";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { STATUS_META, normaliseReferralStatus } from "../data";

interface ReferralDetailProps {
  id: string;
}

const ReferralDetail = ({ id }: ReferralDetailProps) => {
  const { data, isLoading, isError, refetch } = useReferralBusinessQuery(id);
  const business = data?.data;

  if (isLoading) {
    return <ReferralDetailSkeleton />;
  }

  if (isError || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 gap-3 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-400" />
        <p className="text-base font-semibold text-gray-900">
          Couldn't load this referral
        </p>
        <p className="text-sm text-gray-500 max-w-sm">
          {isError
            ? "We hit an error fetching this business. Check your connection and try again."
            : "We couldn't find this business in your referral list."}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {isError && (
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          )}
          <Link href="/referral">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to referrals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusKey = normaliseReferralStatus(business.status);
  const status = STATUS_META[statusKey];
  const allocation = business.reward_allocation;
  // Prefer the backend's percentage_earned; fall back to a derived ratio so
  // the bar never reads 0% when unlocked > 0 because the field was missing.
  const progressPct = (() => {
    if (typeof allocation?.percentage_earned === "number") {
      return Math.min(100, Math.max(0, Math.round(allocation.percentage_earned)));
    }
    if (allocation?.total_reward) {
      return Math.min(
        100,
        Math.round((allocation.unlocked / allocation.total_reward) * 100),
      );
    }
    return 0;
  })();

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 p-4 md:p-6 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/referral"
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Back to referrals"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {business.business_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
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
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CalendarClock className="w-3 h-3" />
                {business.days_remaining > 0
                  ? `${business.days_remaining} days remaining`
                  : "Window expired"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reward allocation */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Reward Allocation
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <AllocationTile
            label="Total Reward"
            value={formatToNaira(allocation?.total_reward ?? 0)}
            tone="neutral"
          />
          <AllocationTile
            label="Unlocked"
            value={formatToNaira(allocation?.unlocked ?? 0)}
            tone="green"
          />
          <AllocationTile
            label="Pending"
            value={formatToNaira(allocation?.pending ?? 0)}
            tone="amber"
          />
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Earned {formatToNaira(allocation?.unlocked ?? 0)} of{" "}
              {formatToNaira(allocation?.total_reward ?? 0)} available reward.
            </span>
            <span className="font-semibold text-emerald-700">
              {progressPct}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">
            Recent Subscription Activity
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Every subscription this business renews adds to your unlocked
            balance.
          </p>
        </div>

        {business.recent_activity.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            No subscription activity yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="py-2.5 px-4 text-xs font-medium text-gray-600">
                      Date
                    </th>
                    <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                      Subscription
                    </th>
                    <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                      Your Reward
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {business.recent_activity.map((act, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {act.date
                          ? moment(act.date).format("MMM D, YYYY")
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 text-right">
                        {formatToNaira(Number(act.subscription) || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-emerald-700 text-right">
                        +{formatToNaira(Number(act.reward) || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="sm:hidden divide-y divide-gray-100">
              {business.recent_activity.map((act, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {act.date ? moment(act.date).format("MMM D, YYYY") : "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Subscription{" "}
                      {formatToNaira(Number(act.subscription) || 0)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">
                    +{formatToNaira(Number(act.reward) || 0)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

interface AllocationTileProps {
  label: string;
  value: string;
  tone: "neutral" | "green" | "amber";
}
const AllocationTile = ({ label, value, tone }: AllocationTileProps) => {
  const styles =
    tone === "green"
      ? "bg-emerald-50 border-emerald-100 text-emerald-900"
      : tone === "amber"
        ? "bg-amber-50 border-amber-100 text-amber-900"
        : "bg-gray-50 border-gray-100 text-gray-900";
  return (
    <div className={cn("border rounded-lg p-3", styles)}>
      <p className="text-[11px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-lg sm:text-xl font-bold mt-1">{value}</p>
    </div>
  );
};

// Skeleton mirrors the real layout (header + allocation card + activity card)
// so the page doesn't jump around when data lands. Matches the pattern used
// on the orders ViewOrder detail screen.
const ReferralDetailSkeleton = () => {
  const Bar = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "bg-gray-200 rounded animate-pulse",
        className,
      )}
    />
  );

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 p-4 md:p-6 bg-gray-50">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Bar className="h-7 w-7 rounded-md" />
        <div className="flex-1 space-y-2">
          <Bar className="h-6 w-48" />
          <div className="flex items-center gap-2">
            <Bar className="h-4 w-28 rounded-full" />
            <Bar className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Reward allocation card skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <Bar className="h-4 w-36 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-100 bg-gray-50 rounded-lg p-3 space-y-2"
            >
              <Bar className="h-3 w-20" />
              <Bar className="h-6 w-28" />
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <Bar className="h-3 w-2/3" />
            <Bar className="h-3 w-10" />
          </div>
          <Bar className="h-2.5 w-full rounded-full" />
        </div>
      </div>

      {/* Activity card skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="p-4 sm:p-5 border-b border-gray-100 space-y-2">
          <Bar className="h-4 w-56" />
          <Bar className="h-3 w-72" />
        </div>
        <div className="p-4 sm:p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="space-y-1.5 flex-1">
                <Bar className="h-3.5 w-32" />
                <Bar className="h-3 w-40" />
              </div>
              <Bar className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralDetail;
