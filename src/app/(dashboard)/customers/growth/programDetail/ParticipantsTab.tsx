"use client";

import { cn } from "@/lib/utils";
import type { LoyaltyProgram } from "@/types/loyalty";
import ParticipantRow from "./ParticipantRow";
import { PARTICIPANT_FILTERS } from "./primitives";
import type { ProgramDetailData } from "./useProgramDetail";

const ParticipantsTab = ({
  detail,
  program,
}: {
  detail: ProgramDetailData;
  program: LoyaltyProgram | null;
}) => {
  const { filter, setFilter, filtered, participants, target } = detail;

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-2">
        {PARTICIPANT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[11px] font-bold cursor-pointer transition-colors",
              filter === f
                ? "bg-grey-1 text-white"
                : "border border-grey-5 bg-white text-grey-3 hover:text-grey-1",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-grey-3">
            {participants.length === 0
              ? "Nobody has joined this campaign yet."
              : `No ${filter.toLowerCase()} participants.`}
          </p>
        ) : (
          filtered.map((p) => (
            <ParticipantRow
              key={p.id}
              participant={p}
              target={target}
              rewardSummary={program?.reward_summary}
            />
          ))
        )}
      </div>

    </div>
  );
};

export default ParticipantsTab;
