"use client";

import { STYLES } from "../config";
import { OptionRow, StepShell, type StepProps } from "./StepShell";

const StyleStep = ({ state, set }: StepProps) => (
  <StepShell
    title="Reward Style"
    subtitle="Should this programme keep rewarding customers, or end after one completion?"
  >
    <div className="flex flex-col gap-3">
      {STYLES.map((style) => (
        <OptionRow
          key={style.value}
          selected={state.rewardStyle === style.value}
          icon={style.icon}
          title={style.title}
          text={style.text}
          onSelect={() => set("rewardStyle", style.value)}
        />
      ))}
    </div>
  </StepShell>
);

export default StyleStep;
