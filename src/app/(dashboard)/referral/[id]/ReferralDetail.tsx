"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowLeft, CalendarClock, Sparkles } from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { getReferralBusiness, STATUS_META } from "../data";

interface ReferralDetailProps {
  id: string;
}

const ReferralDetail = ({ id }: ReferralDetailProps) => {
  const business = getReferralBusiness(id);

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 gap-3 text-center">
        <p className="text-base font-semibold text-gray-900">
          Referral not found
        </p>
        <p className="text-sm text-gray-500">
          We couldn't find this business in your referral list.
        </p>
        <Link href="/referral">
          <Button variant="outline" className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to referrals
          </Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_META[business.status];
  const progressPct = business.totalReward
    ? Math.min(100, Math.round((business.unlocked / business.totalReward) * 100))
    : 0;

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
              {business.name}
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
                {business.expiresInDays > 0
                  ? `${business.expiresInDays} days remaining`
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
            value={formatToNaira(business.totalReward)}
            tone="neutral"
          />
          <AllocationTile
            label="Unlocked"
            value={formatToNaira(business.unlocked)}
            tone="green"
          />
          <AllocationTile
            label="Pending"
            value={formatToNaira(business.pending)}
            tone="amber"
          />
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Earned {formatToNaira(business.unlocked)} of{" "}
              {formatToNaira(business.totalReward)} available reward.
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

        {business.activity.length === 0 ? (
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
                  {business.activity.map((act, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {moment(act.date).format("MMM D, YYYY")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 text-right">
                        {formatToNaira(act.subscription)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-emerald-700 text-right">
                        +{formatToNaira(act.reward)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="sm:hidden divide-y divide-gray-100">
              {business.activity.map((act, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {moment(act.date).format("MMM D, YYYY")}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Subscription {formatToNaira(act.subscription)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">
                    +{formatToNaira(act.reward)}
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
      <p className="text-[11px] uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="text-lg sm:text-xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default ReferralDetail;
