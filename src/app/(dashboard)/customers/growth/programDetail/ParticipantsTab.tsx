"use client";

import { cn } from "@/lib/utils";
import ParticipantRow from "./ParticipantRow";
import { PARTICIPANT_FILTERS } from "./primitives";
import type { ProgramDetailData } from "./useProgramDetail";

const ParticipantsTab = ({ detail }: { detail: ProgramDetailData }) => {
  const { filter, setFilter, filtered, participants, target } = detail;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PARTICIPANT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-bold cursor-pointer transition-colors",
              filter === f
                ? "bg-grey-1 text-white"
                : "bg-white text-grey-3 border border-grey-5 hover:text-grey-1",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-grey-3">
          {participants.length === 0
            ? "Nobody has joined this campaign yet."
            : `No ${filter.toLowerCase()} participants.`}
        </p>
      ) : (
        filtered.map((p) => (
          <ParticipantRow key={p.id} participant={p} target={target} />
        ))
      )}
    </div>
  );
};

export default ParticipantsTab;
