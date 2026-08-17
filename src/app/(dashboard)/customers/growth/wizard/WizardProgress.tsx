"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { STEPS, type StepName } from "./config";

/** Progress is the wizard's only persistent chrome. */
const WizardProgress = ({
  step,
  stepIndex,
  percent,
  onStepClick,
}: {
  step: StepName;
  stepIndex: number;
  percent: number;
  onStepClick: (index: number) => void;
}) => (
  <div className="shrink-0 border-b border-grey-5 pb-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-extrabold text-grey-1">
          Create Loyalty Programme
        </h2>
        <p className="text-[11px] text-grey-3">
          Step {stepIndex + 1} of {STEPS.length} · {step}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-primary-green-500 px-2.5 py-1 text-[10px] font-bold text-primary-green-300">
        {percent}% done
      </span>
    </div>

    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-grey-6">
      <div
        className="h-full rounded-full bg-primary-green-300 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>

    {/* Step chips — completed steps are tappable so you can go back. */}
    <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
      {STEPS.map((name, index) => {
        const done = index < stepIndex;
        const current = index === stepIndex;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onStepClick(index)}
            disabled={!done && !current}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
              current && "bg-grey-1 text-white",
              done && "bg-primary-green-500 text-primary-green-300 cursor-pointer",
              !current && !done && "bg-grey-6 text-grey-4",
            )}
          >
            {done && <Check className="h-3 w-3" />}
            {name}
          </button>
        );
      })}
    </div>
  </div>
);

export default WizardProgress;
