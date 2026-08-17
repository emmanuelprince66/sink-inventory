"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { REWARDS } from "../config";
import { FieldLabel, StepShell, type StepProps } from "./StepShell";

/** Reward types that need a number attached; the rest describe themselves. */
const VALUED_REWARDS = ["POINTS", "WALLET_CREDIT", "PERCENTAGE"];

const RewardStep = ({ state, set }: StepProps) => (
  <StepShell
    title="How should customers earn rewards?"
    subtitle="Choose the reward type that fits your business."
  >
    <div className="flex flex-col gap-3">
      {REWARDS.map((reward) => (
        <button
          key={reward.value}
          type="button"
          onClick={() => set("rewardType", reward.value)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer",
            state.rewardType === reward.value
              ? "border-primary-green-300 bg-primary-green-500"
              : "border-grey-5 bg-white hover:border-primary-green-300/50",
          )}
        >
          <span className="text-xl" aria-hidden>
            {reward.icon}
          </span>
          <span>
            <span className="block text-sm font-bold text-grey-1">
              {reward.title}
            </span>
            <span className="block text-[11px] text-warning-1">
              {reward.hint}
            </span>
          </span>
        </button>
      ))}
    </div>

    {VALUED_REWARDS.includes(state.rewardType) && (
      <div>
        <FieldLabel>Reward value</FieldLabel>
        <Input
          value={state.rewardValue}
          inputMode="decimal"
          onChange={(e) =>
            set("rewardValue", e.target.value.replace(/[^\d.]/g, ""))
          }
          placeholder={state.rewardType === "PERCENTAGE" ? "15" : "5000"}
          className="mt-2 h-11 rounded-xl"
        />
      </div>
    )}
  </StepShell>
);

export default RewardStep;
