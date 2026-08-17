"use client";

import { useFormatMoney } from "@/utils/formatMoney";
import { BadgeCheck, Users, XCircle } from "lucide-react";
import { RateBar, StatTile, rateCaption } from "./primitives";
import type { ProgramDetailData } from "./useProgramDetail";

const DetailOverviewTab = ({ detail }: { detail: ProgramDetailData }) => {
  const formatMoney = useFormatMoney();
  const { overview } = detail;
  const retention = Number(overview?.retention_rate ?? 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <StatTile
          icon={<Users className="h-3.5 w-3.5" />}
          value={overview?.total_enrolled ?? 0}
          label="Total Enrolled"
          tone="text-sky-600"
        />
        <StatTile
          icon={<BadgeCheck className="h-3.5 w-3.5" />}
          value={overview?.active_now ?? 0}
          label="Active Now"
          tone="text-emerald-600"
        />
        <StatTile
          icon={<BadgeCheck className="h-3.5 w-3.5" />}
          value={overview?.completed ?? 0}
          label="Completed"
          tone="text-amber-600"
        />
        <StatTile
          icon={<XCircle className="h-3.5 w-3.5" />}
          value={overview?.cancelled ?? 0}
          label="Cancelled"
          tone="text-rose-600"
        />
      </div>

      <RateBar
        label="Retention Rate"
        rate={retention}
        caption={rateCaption(retention)}
      />
      <RateBar
        label="Completion Rate"
        rate={Number(overview?.completion_rate ?? 0)}
      />

      <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
        <p className="text-xs font-bold text-amber-900">Total given out</p>
        <p className="shrink-0 text-sm font-extrabold text-amber-900">
          {formatMoney(Number(overview?.total_given_out ?? 0))}
        </p>
      </div>
    </div>
  );
};

export default DetailOverviewTab;
