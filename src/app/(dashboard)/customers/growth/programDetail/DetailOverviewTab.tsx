"use client";

import { Trophy, Users, XCircle, Zap } from "lucide-react";
import { RateBar, StatTile, rateCaption } from "./primitives";
import type { ProgramDetailData } from "./useProgramDetail";

const DetailOverviewTab = ({ detail }: { detail: ProgramDetailData }) => {
  const { overview } = detail;
  const retention = Number(overview?.retention_rate ?? 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={<Users className="h-5 w-5 text-grey-1" />}
          value={overview?.total_enrolled ?? 0}
          label="Total Enrolled"
        />
        <StatTile
          icon={<Zap className="h-5 w-5 text-primary-green-300" />}
          value={overview?.active_now ?? 0}
          label="Active Now"
        />
        <StatTile
          icon={<Trophy className="h-5 w-5 text-warning-1" />}
          value={overview?.completed ?? 0}
          label="Completed"
          tone="text-primary-green-300"
        />
        <StatTile
          icon={<XCircle className="h-5 w-5 text-error-1" />}
          value={overview?.cancelled ?? 0}
          label="Cancelled"
          tone="text-error-1"
        />
      </div>

      <RateBar
        label="Retention Rate"
        rate={retention}
        caption={rateCaption(retention)}
        highlight
      />
      <RateBar
        label="Completion Rate"
        rate={Number(overview?.completion_rate ?? 0)}
      />
    </div>
  );
};

export default DetailOverviewTab;
