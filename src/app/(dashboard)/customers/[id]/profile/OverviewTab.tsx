"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { Cell, asDate } from "./primitives";
import type { CustomerProfileData } from "./useCustomerProfile";

const OverviewTab = ({ profile }: { profile: CustomerProfileData }) => {
  const { detail, identity, journey } = profile;

  return (
    <>
      <div className="rounded-2xl border border-grey-5 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-grey-1">
            <Sparkles className="h-3 w-3 text-warning-1" />
          </span>
          <h3 className="text-sm font-extrabold text-grey-1">
            AI Customer Insight
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-grey-2">
          {detail?.ai_customer_insight ??
            "No insight available for this customer yet."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-grey-5 bg-white p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Identity
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Cell label="Name" value={identity?.name} />
            <Cell label="Gender" value={identity?.gender} />
            <Cell label="Phone" value={identity?.phone} tone="text-info-1" />
            <Cell label="Email" value={identity?.email} />
            <Cell
              label="Birthday"
              value={identity?.birthday}
              tone="text-violet-600"
            />
            <Cell label="Customer Since" value={identity?.customer_since} />
            <Cell label="State" value={identity?.state} />
            <Cell label="City" value={identity?.city} />
          </div>
        </div>

        <div className="rounded-2xl border border-grey-5 bg-white p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Customer Journey
          </p>
          {/* Milestones with no date are dimmed rather than hidden — the gap
              in the journey is itself information. */}
          <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-grey-5">
            {journey.map((step) => {
              const date = asDate(step.iso);
              return (
                <li
                  key={step.label}
                  className={cn(
                    "relative flex items-start gap-3",
                    !date && "opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                      date ? step.tone : "bg-grey-6 text-grey-4",
                    )}
                  >
                    ●
                  </span>
                  <div>
                    <p className="text-sm font-bold text-grey-1">
                      {step.label}
                    </p>
                    <p className="text-[11px] text-grey-3">
                      {date ?? "Not yet"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;
