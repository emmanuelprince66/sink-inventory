"use client";

import { Input } from "@/components/ui/input";
import { TIME_LIMITS } from "../config";
import { OptionRow, StepShell, type StepProps } from "./StepShell";

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
  </StepShell>
);

export default TimeStep;
