"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { FieldLabel, StepShell, type StepProps } from "./StepShell";

const RULE_MODES = [
  { value: "VISIT", label: "By Visits" },
  { value: "SPEND", label: "By Spending" },
  { value: "BOTH", label: "Both" },
] as const;

const RulesStep = ({ state, set }: StepProps) => {
  const showVisits = state.ruleMode === "VISIT" || state.ruleMode === "BOTH";
  const showSpend = state.ruleMode === "SPEND" || state.ruleMode === "BOTH";

  return (
    <StepShell
      title="Set the Rules"
      subtitle="Define what customers must do to earn their reward."
    >
      <div className="flex gap-2">
        {RULE_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => set("ruleMode", mode.value)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer",
              state.ruleMode === mode.value
                ? "bg-grey-1 text-white"
                : "bg-grey-6 text-grey-3 hover:text-grey-1",
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {showVisits && (
        <div className="rounded-xl border border-primary-green-300/30 bg-primary-green-500 p-4">
          <FieldLabel>Visits per reward cycle</FieldLabel>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("visits", Math.max(1, state.visits - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-grey-2 hover:bg-grey-6 cursor-pointer"
              aria-label="One fewer visit"
            >
              <Minus className="h-4 w-4" />
            </button>
            <Input
              value={String(state.visits)}
              onChange={(e) =>
                set("visits", Number(e.target.value.replace(/\D/g, "")) || 0)
              }
              className="h-11 w-20 rounded-xl bg-white text-center text-lg font-extrabold"
            />
            <button
              type="button"
              onClick={() => set("visits", state.visits + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-grey-2 hover:bg-grey-6 cursor-pointer"
              aria-label="One more visit"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="text-sm text-grey-3">visits</span>
          </div>

          <div className="mt-3">
            <FieldLabel>Minimum spend per visit (optional)</FieldLabel>
            <Input
              value={state.minSpendPerVisit}
              inputMode="decimal"
              onChange={(e) =>
                set("minSpendPerVisit", e.target.value.replace(/[^\d.]/g, ""))
              }
              placeholder="e.g. 1000"
              className="mt-2 h-11 rounded-xl bg-white"
            />
          </div>
        </div>
      )}

      {showSpend && (
        <div className="rounded-xl border border-primary-green-300/30 bg-primary-green-500 p-4">
          <FieldLabel>Total spend target</FieldLabel>
          <Input
            value={state.spendThreshold}
            inputMode="decimal"
            onChange={(e) =>
              set("spendThreshold", e.target.value.replace(/[^\d.]/g, ""))
            }
            placeholder="e.g. 50000"
            className="mt-2 h-11 rounded-xl bg-white"
          />
        </div>
      )}
    </StepShell>
  );
};

export default RulesStep;
