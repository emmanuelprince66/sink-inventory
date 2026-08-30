"use client";

import { useFetchLoyaltyProgressQuery } from "@/api/loyalty/fetch-loyalty-progress";
import { Spinner } from "@/components/app/Spinner";
import { toList } from "@/types/api";
import type { LoyaltyParticipantProgress } from "@/types/loyalty";

// Shown to a member after joining, and on the standalone progress page. Keyed
// on the loyalty code rather than a session, since members are never signed in.
const MemberProgress = ({ loyaltyCode }: { loyaltyCode: string }) => {
  const { data, isLoading, isError } = useFetchLoyaltyProgressQuery({
    params: { loyaltyCode, isPublic: true },
  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-grey-3 text-center py-6">
        We couldn&apos;t load your progress right now. Try again shortly.
      </p>
    );
  }

  // The endpoint returns either a single progress record or a list of them,
  // one per campaign the member is enrolled in.
  const entries = toList<LoyaltyParticipantProgress>(data?.data as never);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-grey-3 text-center py-6">
        No progress yet — your next visit will start the count.
      </p>
    );
  }

  return (
    <div className="space-y-3 text-left">
      {entries.map((entry) => {
        const target = entry.progress_target ?? 0;
        const current = entry.progress_current ?? 0;
        const pct =
          target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        const complete = target > 0 && current >= target;

        return (
          <div
            key={entry.id ?? entry.member_id}
            className="bg-white rounded-2xl border border-grey-5 p-4"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-sm font-bold text-grey-1 truncate">
                {entry.name ?? "Your progress"}
              </p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  complete
                    ? "bg-primary-green-300/10 text-primary-green-300"
                    : "bg-grey-6 text-grey-3"
                }`}
              >
                {complete ? "Reward ready" : (entry.status ?? "In progress")}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-grey-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-green-300 transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-[11px] text-grey-3 mt-1.5">
              {target > 0
                ? `${current} of ${target} — ${pct}% there`
                : `${current} so far`}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MemberProgress;
