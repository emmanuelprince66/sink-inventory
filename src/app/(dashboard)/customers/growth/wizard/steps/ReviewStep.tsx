"use client";

import { summaryRows } from "../config";
import { FieldLabel, StepShell, type StepProps } from "./StepShell";

/** The card only has room for ten stamps before the reward. */
const MAX_PREVIEW_STAMPS = 10;

const ReviewStep = ({ state }: Pick<StepProps, "state">) => (
  <StepShell
    title={<>Review &amp; Submit</>}
    subtitle="Confirm everything, then submit to create your programme and generate the QR card."
  >
    <div className="overflow-hidden rounded-xl border border-grey-5">
      {summaryRows(state).map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 border-b border-grey-6 px-3.5 py-2.5 last:border-0"
        >
          <span className="text-xs text-grey-3">{row.label}</span>
          <span className="text-right text-xs font-bold text-primary-green-300">
            {row.value}
          </span>
        </div>
      ))}
    </div>

    {/* Streak preview — what the customer's card will show. */}
    <div>
      <FieldLabel>Streak Preview</FieldLabel>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {Array.from(
          { length: Math.min(state.visits, MAX_PREVIEW_STAMPS) },
          (_, i) => (
            <div key={i} className="text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-green-500 text-xs font-extrabold text-primary-green-300">
                {i + 1}
              </span>
              <span className="mt-0.5 block text-[9px] text-grey-4">
                Visit {i + 1}
              </span>
            </div>
          ),
        )}
        <div className="text-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-green-300 text-sm">
            🎁
          </span>
          <span className="mt-0.5 block text-[9px] text-grey-4">Reward</span>
        </div>
      </div>
    </div>

    <p className="rounded-xl bg-warning-2 px-3 py-2.5 text-[11px] leading-relaxed text-warning-1">
      💡 After submitting, you&apos;ll choose a QR card design your customers can
      scan to join.
    </p>
  </StepShell>
);

export default ReviewStep;
