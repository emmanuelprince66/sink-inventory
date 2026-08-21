"use client";

import { cn } from "@/lib/utils";
import type { LoyaltyDashboard } from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import { Gift, Trophy, Users } from "lucide-react";
import { asNumber } from "../loyaltyFormat";

const LoyaltyStatCards = ({
  dashboard,
}: {
  dashboard: LoyaltyDashboard | undefined;
}) => {
  const formatMoney = useFormatMoney();

  const stats = [
    {
      icon: <Users className="w-4 h-4" />,
      label: "Total Participants",
      value: String(dashboard?.total_participants ?? 0),
      tone: "text-grey-1",
    },
    {
      icon: <Gift className="w-4 h-4" />,
      label: "Total Rewarded",
      value: formatMoney(asNumber(dashboard?.total_rewarded)),
      tone: "text-error-1",
    },
    {
      icon: <Trophy className="w-4 h-4" />,
      label: "Total Completions",
      value: String(dashboard?.total_completions ?? 0),
      tone: "text-primary-green-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-grey-5 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-secondary-6 text-primary-green-300 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <p className="text-xs font-bold text-grey-3">{stat.label}</p>
          </div>
          <p className={cn("text-2xl font-extrabold", stat.tone)}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default LoyaltyStatCards;
