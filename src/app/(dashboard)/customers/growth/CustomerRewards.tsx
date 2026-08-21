"use client";

import { useFetchRewardsAnalyticsQuery } from "@/api/loyalty/fetch-rewards-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { useFormatMoney } from "@/utils/formatMoney";
import {
  Award,
  BadgePercent,
  CircleDollarSign,
  Gift,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { GrowthStatCard } from "./GrowthStatCard";
import { asRate } from "./loyaltyFormat";

const KPI_TONES = [
  "bg-secondary-6 text-primary-green-300",
  "bg-info-2 text-info-1",
  "bg-success-2 text-success-1",
  "bg-warning-2 text-warning-1",
];

// The reward_summary string the API returns leads with the reward type, so a
// prefix match picks the right icon without a lookup table per campaign.
const iconForReward = (summary: string) => {
  if (summary.includes("%")) return <Percent className="w-4 h-4" />;
  if (/wallet|credit/i.test(summary)) return <Wallet className="w-4 h-4" />;
  if (/₦|cash/i.test(summary)) return <CircleDollarSign className="w-4 h-4" />;
  return <Gift className="w-4 h-4" />;
};

/** Retention reads green when healthy, amber mid, grey when there is none. */
const retentionTone = (rate: number) =>
  rate >= 70
    ? "bg-success-2 text-success-1"
    : rate >= 40
      ? "bg-warning-2 text-warning-1"
      : "bg-grey-6 text-grey-3";

const CustomerRewards = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();
  const { data: analyticsRes, isLoading } = useFetchRewardsAnalyticsQuery({
    params: { id: business_id ?? "" },
  });

  const summary = analyticsRes?.data?.summary;
  const breakdown = analyticsRes?.data?.per_campaign_breakdown ?? [];
  const likelihood = analyticsRes?.data?.return_likelihood_by_program ?? [];

  // Return likelihood arrives as its own list keyed by programme, so index it
  // once rather than scanning it per row.
  const likelihoodById = new Map(
    likelihood.map((entry) => [entry.program_id, entry.return_likelihood_percentage]),
  );

  const kpis = [
    {
      icon: <Award className="w-4 h-4" />,
      label: "Active Rewards",
      value: String(breakdown.length),
    },
    {
      icon: <Gift className="w-4 h-4" />,
      label: "Total Issued",
      value: formatMoney(Number(summary?.total_sent ?? 0)),
    },
    {
      icon: <BadgePercent className="w-4 h-4" />,
      label: "Redeemed",
      value: formatMoney(Number(summary?.total_redeemed ?? 0)),
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Avg Retention",
      value: `${asRate(summary?.avg_retention_rate)}%`,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-grey-5" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl bg-grey-5" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <GrowthStatCard
            key={kpi.label}
            icon={kpi.icon}
            iconTone={KPI_TONES[idx]}
            label={kpi.label}
            value={kpi.value}
          />
        ))}
      </div>

      {/* Retained revenue and ROI are business-wide on this endpoint, not
          per campaign, so they sit above the table rather than inside it. */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-grey-5 bg-white p-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Est. Retained Revenue
          </p>
          <p className="mt-1 text-lg font-extrabold text-primary-green-300">
            {formatMoney(Number(summary?.est_retained_rev ?? 0))}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Overall ROI
          </p>
          <p className="mt-1 text-lg font-extrabold text-success-1">
            {Number(summary?.overall_roi_percentage ?? 0) >= 0 ? "+" : ""}
            {asRate(summary?.overall_roi_percentage)}%
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Cancelled / Forfeited
          </p>
          <p className="mt-1 text-lg font-extrabold text-error-1">
            {formatMoney(Number(summary?.cancelled ?? 0))}
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-grey-5">
          <h3 className="text-sm font-extrabold text-grey-1">Active Rewards</h3>
        </div>

        {breakdown.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-grey-3">
            No reward activity yet. Figures appear here once a campaign starts
            issuing rewards.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-grey-6 text-[11px] uppercase tracking-wide text-grey-3">
                  <th className="text-left font-bold px-4 sm:px-5 py-3">
                    Campaign
                  </th>
                  <th className="text-left font-bold px-4 py-3">Reward</th>
                  <th className="text-left font-bold px-4 py-3">Issued</th>
                  <th className="text-left font-bold px-4 py-3">Redeemed</th>
                  <th className="text-left font-bold px-4 py-3">Cancelled</th>
                  <th className="text-left font-bold px-4 py-3">Retention</th>
                  <th className="text-left font-bold px-4 sm:px-5 py-3">
                    Return Likelihood
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((campaign) => {
                  const retention = Number(campaign.retention_rate ?? 0);
                  const returns = likelihoodById.get(campaign.program_id);

                  return (
                    <tr
                      key={campaign.program_id}
                      className="border-b border-grey-6 last:border-0"
                    >
                      <td className="px-4 sm:px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-secondary-6 text-primary-green-300 flex items-center justify-center shrink-0">
                            {iconForReward(campaign.reward_summary ?? "")}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-grey-1 whitespace-nowrap">
                              {campaign.program_name}
                            </p>
                            <p className="text-[11px] text-grey-3 whitespace-nowrap">
                              {campaign.trigger_summary}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-grey-3 whitespace-nowrap">
                        {campaign.reward_summary}
                      </td>
                      <td className="px-4 py-3 text-grey-2 whitespace-nowrap">
                        {formatMoney(Number(campaign.total_sent ?? 0))}
                      </td>
                      <td className="px-4 py-3 font-bold text-success-1 whitespace-nowrap">
                        {formatMoney(Number(campaign.total_redeemed ?? 0))}
                      </td>
                      <td className="px-4 py-3 font-bold text-error-1 whitespace-nowrap">
                        {formatMoney(Number(campaign.cancelled ?? 0))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                            retentionTone(retention),
                          )}
                        >
                          {asRate(retention)}%
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        {returns === undefined ? (
                          <span className="text-grey-4">—</span>
                        ) : (
                          <span className="font-bold text-grey-2">
                            {asRate(returns)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerRewards;
