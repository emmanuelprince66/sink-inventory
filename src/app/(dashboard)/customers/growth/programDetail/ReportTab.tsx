"use client";

import { useFormatMoney } from "@/utils/formatMoney";
import {
  BadgeCheck,
  CheckSquare,
  Gift,
  Send,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { asRate, formatRewardAmount } from "../loyaltyFormat";
import { StatRow } from "./primitives";
import type { ProgramDetailData } from "./useProgramDetail";

const ReportTab = ({ detail }: { detail: ProgramDetailData }) => {
  const formatMoney = useFormatMoney();
  const { report, overview, programInfo } = detail;

  // What this programme rewards in. The three reward totals below are reported
  // in that unit, so a 50%-off programme was showing "₦50.00" where it meant
  // "50%". Retained revenue is money whatever the reward is, and stays money.
  const rewardType = programInfo?.reward_type;
  const inRewardUnit = (value: string | number | undefined | null) =>
    formatRewardAmount(value, rewardType, formatMoney);

  const rows = [
    {
      icon: <Send className="h-4 w-4" />,
      label: "Total Rewards Sent",
      value: inRewardUnit(report?.total_rewards_sent),
      tone: "text-primary-green-300",
      surface: "bg-primary-green-500",
      border: "border-primary-green-300/35",
    },
    {
      icon: <BadgeCheck className="h-4 w-4" />,
      label: "Total Redeemed",
      value: inRewardUnit(report?.total_redeemed),
      tone: "text-primary-green-300",
      surface: "bg-primary-green-500",
      border: "border-primary-green-300/35",
    },
    {
      icon: <XCircle className="h-4 w-4" />,
      label: "Cancelled / Forfeited",
      value: inRewardUnit(report?.cancelled_forfeited),
      tone: "text-error-1",
      surface: "bg-error-2",
      border: "border-error-1/30",
    },
    {
      icon: <CheckSquare className="h-4 w-4" />,
      label: "Estimated Retained Revenue",
      value: formatMoney(Number(report?.estimated_retained_revenue ?? 0)),
      tone: "text-warning-1",
      surface: "bg-warning-2",
      border: "border-warning-1/30",
    },
  ];

  const likelihood = [
    {
      label: "After 1st reward",
      value: report?.return_likelihood?.after_1st_reward ?? 0,
    },
    {
      label: "After 2nd reward",
      value: report?.return_likelihood?.after_2nd_reward ?? 0,
    },
    {
      label: "After 3rd reward+",
      value: report?.return_likelihood?.after_3rd_reward_plus ?? 0,
    },
  ];

  const roi = Number(report?.estimated_roi_percentage ?? 0);
  const retention = Number(overview?.retention_rate ?? 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-4 w-4 text-primary-green-300" />
        <h4 className="text-sm font-extrabold text-grey-1">
          Reward Cost Report
        </h4>
      </div>

      {rows.map((row) => (
        <StatRow key={row.label} {...row} />
      ))}

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-grey-5 bg-primary-green-700 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-grey-1">Estimated ROI</p>
          <p className="mt-0.5 text-[11px] text-grey-4">
            Based on {asRate(retention)}% retention
          </p>
        </div>
        <p className="shrink-0 text-2xl font-extrabold text-primary-green-300">
          {roi >= 0 ? "+" : ""}
          {asRate(roi)}%
        </p>
      </div>

      <div className="rounded-2xl border border-grey-5 bg-primary-green-700 p-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Gift className="h-4 w-4 text-warning-1" />
          <p className="text-sm font-bold text-grey-1">
            Likelihood of Customer Return
          </p>
        </div>
        {likelihood.map((row) => (
          <div key={row.label} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-grey-3">{row.label}</p>
              <p className="shrink-0 text-[11px] font-bold text-grey-2">
                {asRate(row.value)}%
              </p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-grey-6">
              <div
                className="h-full rounded-full bg-primary-green-300"
                style={{
                  width: `${Math.min(100, Math.max(0, Number(row.value)))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTab;
