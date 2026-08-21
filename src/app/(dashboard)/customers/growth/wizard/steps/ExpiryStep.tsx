"use client";

import { TIMEOUT_ACTIONS } from "../config";
import { OptionRow, StepShell, type StepProps } from "./StepShell";

const ExpiryStep = ({ state, set }: StepProps) => (
  <StepShell
    title={<>If they don&apos;t complete in time...</>}
    subtitle="What happens when a customer runs out of time to complete the streak?"
  >
    <div className="flex flex-col gap-3">
      {TIMEOUT_ACTIONS.map((action) => (
        <OptionRow
          key={action.value}
          selected={state.timeoutAction === action.value}
          icon={action.icon}
          title={action.title}
          text={action.text}
          onSelect={() => set("timeoutAction", action.value)}
        />
      ))}
    </div>
  </StepShell>
);

export default ExpiryStep;
