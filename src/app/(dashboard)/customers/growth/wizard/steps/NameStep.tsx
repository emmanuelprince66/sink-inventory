"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { NAME_PRESETS } from "../config";
import { FieldLabel, StepShell, type StepProps } from "./StepShell";

const NameStep = ({ state, set }: StepProps) => (
  <StepShell
    title="Basic Information"
    subtitle="Give your loyalty programme an identity your customers will recognise."
  >
    <div>
      <FieldLabel>Business Name</FieldLabel>
      <Input
        value={state.businessName}
        onChange={(e) => set("businessName", e.target.value)}
        placeholder="e.g. The Coffee Hub"
        className="mt-2 h-11 rounded-xl"
      />
    </div>

    <div>
      <FieldLabel>Programme Name</FieldLabel>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NAME_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => set("name", preset)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors cursor-pointer",
              state.name === preset
                ? "border-primary-green-300 bg-primary-green-500 text-primary-green-300"
                : "border-grey-5 bg-white text-warning-1 hover:border-primary-green-300/50",
            )}
          >
            {preset}
          </button>
        ))}
      </div>
      {/* Blank when a preset is selected, so the two controls never disagree. */}
      <Input
        value={NAME_PRESETS.includes(state.name) ? "" : state.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Or type a custom name..."
        className="mt-2 h-11 rounded-xl"
      />
    </div>

    <div>
      <FieldLabel>
        Description <span className="text-primary-green-300">(Optional)</span>
      </FieldLabel>
      <Textarea
        value={state.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Help customers understand what this programme is about."
        rows={4}
        className="mt-2 rounded-xl"
      />
    </div>
  </StepShell>
);

export default NameStep;
