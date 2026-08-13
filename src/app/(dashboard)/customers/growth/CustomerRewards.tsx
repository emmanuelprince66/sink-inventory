"use client";

import {
  Award,
  BadgePercent,
  CircleDollarSign,
  Gift,
  Percent,
  Wallet,
} from "lucide-react";
import { useFetchRewardsAnalyticsQuery } from "@/api/loyalty/fetch-rewards-analytics";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useFormatMoney } from "@/utils/formatMoney";
import { REWARDS, REWARDS_KPIS } from "./dummyGrowthData";
import { GrowthStatCard } from "./GrowthStatCard";

interface RewardRowView {
  key: string;
  name: string;
  type: string;
  issued: string | number;
  redeemed: string | number;
  expired: string | number;
  cost: string;
  roi: string;
}

const KPI_ICONS = [
  { icon: <Award className="w-4 h-4" />, tone: "bg-secondary-6 text-primary-green-300" },
  { icon: <Gift className="w-4 h-4" />, tone: "bg-info-2 text-info-1" },
  { icon: <BadgePercent className="w-4 h-4" />, tone: "bg-success-2 text-success-1" },
  { icon: <Percent className="w-4 h-4" />, tone: "bg-warning-2 text-warning-1" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "Percentage Discount": <Percent className="w-4 h-4" />,
  "Wallet Credit": <Wallet className="w-4 h-4" />,
  "Free Product": <Gift className="w-4 h-4" />,
  "Cash Discount": <CircleDollarSign className="w-4 h-4" />,
};

const CustomerRewards = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();
  const { data: analyticsRes } = useFetchRewardsAnalyticsQuery({
    params: { id: business_id ?? "" },
  });

  const summary = analyticsRes?.data?.summary;
  const breakdown = analyticsRes?.data?.per_campaign_breakdown;

  const kpis =
    summary && breakdown
      ? [
          { label: "Active Rewards", value: String(breakdown.length), delta: "" },
          {
            label: "Total Issued",
            value: formatMoney(Number(summary.total_sent ?? 0)),
            delta: "",
          },
          {
            label: "Redeemed",
            value: formatMoney(Number(summary.total_redeemed ?? 0)),
            delta: "",
          },
          {
            label: "Redemption Rate",
            value: `${
              Number(summary.total_sent) > 0
                ? (
                    (Number(summary.total_redeemed) / Number(summary.total_sent)) *
                    100
                  ).toFixed(1)
                : "0.0"
            }%`,
            delta: "",
          },
        ]
      : REWARDS_KPIS;

  // Fall back to the sample rows until the business has live reward analytics.
  const rows: RewardRowView[] = breakdown?.length
    ? breakdown.map((c) => ({
        key: c.program_id,
        name: c.program_name,
        type: c.reward_summary,
        issued: c.total_sent,
        redeemed: c.total_redeemed,
        expired: c.cancelled,
        // Per-campaign cost isn't exposed on this endpoint — only the overall
        // est_retained_rev on the summary — so it stays blank for live data.
        cost: "—",
        roi: `${c.retention_rate}%`,
      }))
    : REWARDS;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <GrowthStatCard
            key={kpi.label}
            icon={KPI_ICONS[idx].icon}
            iconTone={KPI_ICONS[idx].tone}
            label={kpi.label}
            value={kpi.value}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-grey-5">
          <h3 className="text-sm font-extrabold text-grey-1">Active Rewards</h3>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-green-300 text-white text-sm font-bold hover:bg-primary-green-300/90 cursor-pointer">
            + Create Reward
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-grey-6 text-[11px] uppercase tracking-wide text-grey-3">
                <th className="text-left font-bold px-4 sm:px-5 py-3">Reward</th>
                <th className="text-left font-bold px-4 py-3">Type</th>
                <th className="text-left font-bold px-4 py-3">Issued</th>
                <th className="text-left font-bold px-4 py-3">Redeemed</th>
                <th className="text-left font-bold px-4 py-3">Expired</th>
                <th className="text-left font-bold px-4 py-3">Cost</th>
                <th className="text-left font-bold px-4 py-3">ROI</th>
                <th className="text-left font-bold px-4 sm:px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((reward) => (
                <tr key={reward.key} className="border-b border-grey-6 last:border-0">
                  <td className="px-4 sm:px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-secondary-6 text-primary-green-300 flex items-center justify-center shrink-0">
                        {TYPE_ICONS[reward.type] ?? <Gift className="w-4 h-4" />}
                      </span>
                      <span className="font-bold text-grey-1">
                        {reward.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-grey-3">{reward.type}</td>
                  <td className="px-4 py-3 text-grey-2">{reward.issued}</td>
                  <td className="px-4 py-3 text-success-1 font-bold">
                    {reward.redeemed}
                  </td>
                  <td className="px-4 py-3 text-error-1 font-bold">
                    {reward.expired}
                  </td>
                  <td className="px-4 py-3 text-grey-2">{reward.cost}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-success-2 text-success-1">
                      {reward.roi}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3 text-right">
                    <button className="text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 cursor-pointer">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerRewards;
