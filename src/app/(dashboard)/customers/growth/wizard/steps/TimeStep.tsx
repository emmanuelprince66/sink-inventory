"use client";

import { Input } from "@/components/ui/input";
import { TIME_LIMITS, VISIT_WINDOWS } from "../config";
import { FieldLabel, OptionRow, StepShell, type StepProps } from "./StepShell";

const TimeStep = ({ state, set }: StepProps) => (
  <StepShell
    title="Time Requirement"
    subtitle="Must customers complete the streak within a certain time period?"
  >
    <div className="flex flex-col gap-3">
      {TIME_LIMITS.map((limit) => (
        <OptionRow
          key={limit.value}
          selected={state.timeLimitDays === limit.value}
          icon={limit.icon}
          title={limit.title}
          text={limit.text}
          onSelect={() => set("timeLimitDays", limit.value)}
        />
      ))}
    </div>

    {/* -1 is the sentinel for "custom period". */}
    {state.timeLimitDays === -1 && (
      <Input
        value={state.customDays}
        inputMode="numeric"
        onChange={(e) => set("customDays", e.target.value.replace(/\D/g, ""))}
        placeholder="Number of days"
        className="h-11 rounded-xl"
      />
    )}

    {/* The gap between sales, which is a different question from the deadline
        above: one is how long they have to finish, this is how quickly they
        can make progress. Without it, a five-visit streak is five sales rung
        up back to back at the same till. */}
    <div className="border-t border-grey-5 pt-6">
      <FieldLabel>How often can a visit count?</FieldLabel>
      <p className="mt-1 mb-3 text-xs text-grey-3">
        Time that must pass after a sale before the next one counts towards the
        streak. It stops one basket split into several sales from completing a
        streak in a single trip.
      </p>

      <div className="flex flex-col gap-3">
        {VISIT_WINDOWS.map((window) => (
          <OptionRow
            key={window.value}
            selected={state.visitWindowHours === window.value}
            icon={window.icon}
            title={window.title}
            text={window.text}
            onSelect={() => set("visitWindowHours", window.value)}
          />
        ))}
      </div>

      {state.visitWindowHours === -1 && (
        <Input
          value={state.customVisitWindowHours}
          inputMode="numeric"
          onChange={(e) =>
            set("customVisitWindowHours", e.target.value.replace(/\D/g, ""))
          }
          placeholder="Number of hours"
          className="mt-3 h-11 rounded-xl"
        />
      )}
    </div>
  </StepShell>
);

export default TimeStep;
