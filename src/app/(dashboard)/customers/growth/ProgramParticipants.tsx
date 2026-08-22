"use client";

import { useFetchLoyaltyProgramDetailQuery } from "@/api/loyalty/fetch-loyalty-program-detail";
import { Spinner } from "@/components/app/Spinner";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import BonusPeriods from "./BonusPeriods";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success-2 text-success-1",
  COMPLETED: "bg-secondary-6 text-primary-green-300",
  PAUSED: "bg-warning-2 text-warning-1",
  EXPIRED: "bg-grey-6 text-grey-3",
  CANCELLED: "bg-error-2 text-error-1",
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

const ProgramParticipants = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useFetchLoyaltyProgramDetailQuery({
    params: { programId },
  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-16">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  const detail = data?.data;
  const overview = detail?.overview;
  const participants = detail?.participants ?? [];
  const cost = detail?.reward_cost_report;

  const stats = [
    { label: "Enrolled", value: overview?.total_enrolled ?? 0 },
    { label: "Active", value: overview?.active_now ?? 0 },
    { label: "Completed", value: overview?.completed ?? 0 },
    { label: "Cancelled", value: overview?.cancelled ?? 0 },
    { label: "Completion", value: `${overview?.completion_rate ?? 0}%` },
    { label: "Retention", value: `${overview?.retention_rate ?? 0}%` },
  ];

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-grey-6 rounded-xl py-3 text-center"
          >
            <p className="text-base font-extrabold text-grey-1">{s.value}</p>
            <p className="text-[10px] text-grey-3 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {cost && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-warning-2/50">
          <div>
            <p className="text-xs font-bold text-grey-1">Reward cost report</p>
            <p className="text-[11px] text-grey-3">
              {cost.total_rewards_sent} sent · {cost.total_redeemed} redeemed ·{" "}
              {cost.cancelled_forfeited} forfeited
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-primary-green-300">
              {cost.estimated_retained_revenue}
            </p>
            <p className="text-[10px] text-grey-3">
              ROI: {cost.estimated_roi_percentage}%
            </p>
          </div>
        </div>
      )}

      {/* Bonus multiplier campaigns for this programme */}
      <BonusPeriods programId={programId} />

      {/* Participants */}
      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="p-4 border-b border-grey-5 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-green-300" />
          <h4 className="text-sm font-extrabold text-grey-1">
            Participants ({participants.length})
          </h4>
        </div>

        {participants.length === 0 ? (
          <p className="text-sm text-grey-3 text-center py-10">
            No one has joined this campaign yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-grey-6 text-[11px] uppercase tracking-wide text-grey-3">
                  <th className="text-left font-bold px-4 py-3">Customer</th>
                  <th className="text-left font-bold px-4 py-3">Joined</th>
                  <th className="text-left font-bold px-4 py-3">Last visit</th>
                  <th className="text-left font-bold px-4 py-3">Progress</th>
                  <th className="text-left font-bold px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => {
                  const pct = p.progress_target
                    ? Math.min(100, (p.progress_current / p.progress_target) * 100)
                    : 0;
                  return (
                    <tr key={p.id} className="border-b border-grey-6 last:border-0">
                      <td className="px-4 py-3 font-bold text-grey-1">{p.name}</td>
                      <td className="px-4 py-3 text-grey-3">
                        {formatDate(p.joined_at)}
                      </td>
                      <td className="px-4 py-3 text-grey-3">
                        {formatDate(p.last_qualifying_visit_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 h-1.5 rounded-full bg-grey-6 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary-green-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-grey-2 shrink-0">
                            {p.progress_current}/{p.progress_target ?? "∞"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
                            STATUS_STYLES[p.status] ?? "bg-grey-6 text-grey-3",
                          )}
                        >
                          {p.status}
                        </span>
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

export default ProgramParticipants;
