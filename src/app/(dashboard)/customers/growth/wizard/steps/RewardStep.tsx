"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Package, Scissors } from "lucide-react";
import { useState } from "react";
import { REWARDS } from "../config";
import InventoryPickerSheet from "./InventoryPickerSheet";
import { FieldLabel, StepShell, type StepProps } from "./StepShell";

/** Reward types that need a number attached; the rest describe themselves. */
const VALUED_REWARDS = ["POINTS", "WALLET_CREDIT", "PERCENTAGE"];

/**
 * Free Product and Free Service both hand over a real inventory line, so the
 * merchant picks it here rather than typing a description the till cannot
 * resolve. reward_product and reward_service are separate fields on the API,
 * which is why the two cases stay apart instead of sharing one id.
 */
const GiveawayPicker = ({ state, set }: StepProps) => {
  const [open, setOpen] = useState(false);
  const isProduct = state.rewardType === "FREE_ITEM";

  const pickedName = isProduct
    ? state.rewardProductName
    : state.rewardServiceName;
  const pickedId = isProduct ? state.rewardProductId : state.rewardServiceId;

  return (
    <div>
      <FieldLabel>
        {isProduct ? "Which product?" : "Which service?"}
      </FieldLabel>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "mt-2 flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer",
          pickedName
            ? "border-primary-green-300 bg-primary-green-500"
            : "border-dashed border-grey-5 bg-white hover:border-primary-green-300/50",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            pickedName
              ? "bg-white text-primary-green-300"
              : "bg-grey-6 text-grey-4",
          )}
        >
          {isProduct ? (
            <Package className="h-4 w-4" />
          ) : (
            <Scissors className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-grey-1">
            {pickedName || `Choose a ${isProduct ? "product" : "service"}`}
          </span>
          <span className="block text-[11px] text-grey-3">
            {pickedName
              ? "Tap to choose a different one"
              : `Picked from your inventory`}
          </span>
        </span>
      </button>

      <InventoryPickerSheet
        open={open}
        onClose={() => setOpen(false)}
        type={isProduct ? "PRODUCT" : "SERVICE"}
        selectedId={pickedId || undefined}
        onSelect={(item) => {
          if (isProduct) {
            set("rewardProductId", item.id);
            set("rewardProductName", item.name);
          } else {
            set("rewardServiceId", item.id);
            set("rewardServiceName", item.name);
          }
          setOpen(false);
        }}
      />
    </div>
  );
};

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

    {(state.rewardType === "FREE_ITEM" ||
      state.rewardType === "FREE_SERVICE") && (
      <GiveawayPicker state={state} set={set} />
    )}
  </StepShell>
);

export default RewardStep;
