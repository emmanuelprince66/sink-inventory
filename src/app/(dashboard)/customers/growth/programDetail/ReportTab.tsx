"use client";

import { useFormatMoney } from "@/utils/formatMoney";
import { BarChart3 } from "lucide-react";
import { asRate } from "../loyaltyFormat";
import { StatRow } from "./primitives";
import type { ProgramDetailData } from "./useProgramDetail";

const ReportTab = ({ detail }: { detail: ProgramDetailData }) => {
  const formatMoney = useFormatMoney();
  const { report } = detail;

  const rows = [
    {
      label: "Total Rewards Sent",
      value: formatMoney(Number(report?.total_rewards_sent ?? 0)),
      tone: "text-grey-1",
    },
    {
      label: "Total Redeemed",
      value: formatMoney(Number(report?.total_redeemed ?? 0)),
      tone: "text-emerald-700",
    },
    {
      label: "Cancelled / Forfeited",
      value: formatMoney(Number(report?.cancelled_forfeited ?? 0)),
      tone: "text-rose-700",
    },
    {
      label: "Estimated Retained Revenue",
      value: formatMoney(Number(report?.estimated_retained_revenue ?? 0)),
      tone: "text-sky-700",
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <BarChart3 className="h-4 w-4 text-primary-green-300" />
        <h4 className="text-sm font-extrabold text-grey-1">
          Reward Cost Report
        </h4>
      </div>

      {rows.map((row) => (
        <StatRow key={row.label} {...row} />
      ))}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-emerald-900">Estimated ROI</p>
          <p className="shrink-0 text-base font-extrabold text-emerald-700">
            {roi >= 0 ? "+" : ""}
            {asRate(roi)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-grey-5 bg-white p-3">
        <p className="mb-2.5 text-xs font-bold text-grey-1">
          Likelihood of Customer Return
        </p>
        {likelihood.map((row) => (
          <div key={row.label} className="mb-2.5 last:mb-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-grey-3">{row.label}</p>
              <p className="shrink-0 text-[11px] font-bold text-grey-1">
                {asRate(row.value)}%
              </p>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-grey-6">
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
