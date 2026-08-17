"use client";

import { GOALS } from "../config";
import { OptionRow, StepShell, type StepProps } from "./StepShell";

const GoalStep = ({ state, set }: StepProps) => (
  <StepShell
    title="What do you want to encourage?"
    subtitle="This shapes how your programme rewards customers."
  >
    <div className="flex flex-col gap-3">
      {GOALS.map((goal) => (
        <OptionRow
          key={goal.value}
          selected={state.goal === goal.value}
          icon={goal.icon}
          title={goal.title}
          text={goal.text}
          onSelect={() => {
            set("goal", goal.value);
            // The goal picks a sensible default rule mode; Rules can still
            // override it.
            set("ruleMode", goal.value);
          }}
        />
      ))}
    </div>
  </StepShell>
);

export default GoalStep;
