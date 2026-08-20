"use client";

import { cn } from "@/lib/utils";
import { CHANNELS, NOTIFICATIONS } from "../config";
import { FieldLabel, StepShell, type StepProps } from "./StepShell";

const NotifyStep = ({ state, set }: StepProps) => {
  const noneEnabled = NOTIFICATIONS.every(({ key }) => !state[key]);
  const enabledCount = NOTIFICATIONS.filter(({ key }) => state[key]).length;

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

      {/* Channel is only a question if anything is being sent at all. */}
      {!noneEnabled && (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <FieldLabel>How should these reach customers?</FieldLabel>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            {CHANNELS.map((channel) => {
              const selected = state.channel === channel.value;
              return (
                <button
                  key={channel.value}
                  type="button"
                  onClick={() => set("channel", channel.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer",
                    selected
                      ? "border-primary-green-300 bg-primary-green-500"
                      : "border-grey-5 bg-white hover:border-primary-green-300/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                      selected ? "border-primary-green-300" : "border-grey-5",
                    )}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-primary-green-300" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-grey-1">
                      <span aria-hidden>{channel.icon}</span>
                      {channel.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-grey-3">
                      {channel.text}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cost is per message per customer, and four message types times a
              growing membership adds up faster than the per-unit price suggests. */}
          <p className="mt-2 text-[11px] leading-relaxed text-grey-3">
            {enabledCount} message type{enabledCount === 1 ? "" : "s"} enabled —
            each one is charged per customer, per send, from your campaign units.
          </p>
        </div>
      )}
    </StepShell>
  );
};

export default NotifyStep;
