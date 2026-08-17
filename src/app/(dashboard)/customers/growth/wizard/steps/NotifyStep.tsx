"use client";

import { cn } from "@/lib/utils";
import { NOTIFICATIONS } from "../config";
import { StepShell, type StepProps } from "./StepShell";

const NotifyStep = ({ state, set }: StepProps) => {
  const noneEnabled = NOTIFICATIONS.every(({ key }) => !state[key]);

  return (
    <StepShell
      title="Keep customers in the loop"
      subtitle="Choose which messages this programme sends automatically."
    >
      <div className="flex flex-col gap-3">
        {NOTIFICATIONS.map((notification) => {
          const on = state[notification.key];
          return (
            <button
              key={notification.key}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => set(notification.key, !on)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer",
                on
                  ? "border-primary-green-300 bg-primary-green-500"
                  : "border-grey-5 bg-white",
              )}
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-grey-1">
                  {notification.title}
                </span>
                <span className="block text-[11px] text-grey-3">
                  {notification.text}
                </span>
              </span>
              <span
                className={cn(
                  "flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
                  on ? "bg-primary-green-300" : "bg-grey-5",
                )}
              >
                <span
                  className={cn(
                    "h-4 w-4 rounded-full bg-white transition-transform",
                    on && "translate-x-4",
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>

      {noneEnabled && (
        <p className="rounded-xl bg-warning-2 px-3 py-2 text-[11px] font-medium text-warning-1">
          No notifications will be sent — customers will have to track their own
          progress.
        </p>
      )}
    </StepShell>
  );
};

export default NotifyStep;
