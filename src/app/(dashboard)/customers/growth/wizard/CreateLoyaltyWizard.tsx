"use client";

import { useCreateLoyaltyProgramMutation } from "@/api/loyalty/create-loyalty-program";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import type { LoyaltyProgram } from "@/types/loyalty";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import ProgrammeCreated from "./ProgrammeCreated";
import {
  GOALS,
  INITIAL_STATE,
  NAME_PRESETS,
  NOTIFICATIONS,
  REWARDS,
  STEPS,
  STYLES,
  TIMEOUT_ACTIONS,
  TIME_LIMITS,
  buildPayload,
  stepError,
  type WizardState,
} from "./steps";

/** Radio-style option row used by Goal, Time and Expiry. */
const OptionRow = ({
  selected,
  icon,
  title,
  text,
  onSelect,
}: {
  selected: boolean;
  icon: string;
  title: string;
  text: string;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "flex w-full  items-start gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer",
      selected
        ? "border-primary-green-300 bg-primary-green-500"
        : "border-grey-5 bg-white hover:border-primary-green-300/50",
    )}
  >
    <span
      className={cn(
        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary-green-300" : "border-grey-5",
      )}
    >
      {selected && (
        <span className="h-2 w-2 rounded-full bg-primary-green-300" />
      )}
    </span>
    <span className="min-w-0">
      <span className="flex items-center gap-1.5 text-sm font-bold text-grey-1">
        <span aria-hidden>{icon}</span>
        {title}
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-grey-3">
        {text}
      </span>
    </span>
  </button>
);

const CreateLoyaltyWizard = ({ onDone }: { onDone: () => void }) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<LoyaltyProgram | null>(null);

  const step = STEPS[stepIndex];
  const percent = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const { mutate: createProgram, isPending } = useCreateLoyaltyProgramMutation({
    id: business_id ?? "",
    onSuccess: (response: any) => {
      setCreated(response?.data ?? null);
      queryClient.invalidateQueries({
        queryKey: [queryKey.loyalty.getLoyaltyPrograms],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.loyalty.getLoyaltyDashboard],
      });
    },
  });

  const next = () => {
    const problem = stepError(step, state);
    if (problem) return setError(problem);
    setError(null);
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  const submit = () => {
    setError(null);
    createProgram(buildPayload(state) as unknown as LoyaltyProgram);
  };

  // Once created, the wizard hands over to the QR card screen entirely.
  if (created) return <ProgrammeCreated program={created} onDone={onDone} />;

  return (
    <div className="flex flex-col">
      {/* Header — progress is the only persistent chrome. */}
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
                onClick={() => done && setStepIndex(index)}
                disabled={!done && !current}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
                  current && "bg-grey-1 text-white",
                  done &&
                    "bg-primary-green-500 text-primary-green-300 cursor-pointer",
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

      {/* Step body */}
      <div className="py-6">
        {step === "Name" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                Basic Information
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                Give your loyalty programme an identity your customers will
                recognise.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                Business Name
              </label>
              <Input
                value={state.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                placeholder="e.g. The Coffee Hub"
                className="mt-2 h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                Programme Name
              </label>
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
              <Input
                value={NAME_PRESETS.includes(state.name) ? "" : state.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Or type a custom name..."
                className="mt-2 h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                Description{" "}
                <span className="text-primary-green-300">(Optional)</span>
              </label>
              <Textarea
                value={state.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Help customers understand what this programme is about."
                rows={4}
                className="mt-2 rounded-xl"
              />
            </div>
          </div>
        )}

        {step === "Goal" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                What do you want to encourage?
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                This shapes how your programme rewards customers.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {GOALS.map((goal) => (
                <OptionRow
                  key={goal.value}
                  selected={state.goal === goal.value}
                  icon={goal.icon}
                  title={goal.title}
                  text={goal.text}
                  onSelect={() => {
                    set("goal", goal.value);
                    // The goal picks a sensible default rule mode; Rules can
                    // still override it.
                    set("ruleMode", goal.value);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {step === "Reward" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                How should customers earn rewards?
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                Choose the reward type that fits your business.
              </p>
            </div>
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

            {["POINTS", "WALLET_CREDIT", "PERCENTAGE"].includes(
              state.rewardType,
            ) && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                  Reward value
                </label>
                <Input
                  value={state.rewardValue}
                  inputMode="decimal"
                  onChange={(e) =>
                    set("rewardValue", e.target.value.replace(/[^\d.]/g, ""))
                  }
                  placeholder={
                    state.rewardType === "PERCENTAGE" ? "15" : "5000"
                  }
                  className="mt-2 h-11 rounded-xl"
                />
              </div>
            )}
          </div>
        )}

        {step === "Style" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                Reward Style
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                Should this programme keep rewarding customers, or end after one
                completion?
              </p>
            </div>
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
          </div>
        )}

        {step === "Rules" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                Set the Rules
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                Define what customers must do to earn their reward.
              </p>
            </div>

            <div className="flex gap-2">
              {(
                [
                  { value: "VISIT", label: "By Visits" },
                  { value: "SPEND", label: "By Spending" },
                  { value: "BOTH", label: "Both" },
                ] as const
              ).map((mode) => (
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

            {(state.ruleMode === "VISIT" || state.ruleMode === "BOTH") && (
              <div className="rounded-xl border border-primary-green-300/30 bg-primary-green-500 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                  Visits per reward cycle
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set("visits", Math.max(1, state.visits - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-grey-2 hover:bg-grey-6 cursor-pointer"
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
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-grey-3">visits</span>
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                    Minimum spend per visit (optional)
                  </label>
                  <Input
                    value={state.minSpendPerVisit}
                    inputMode="decimal"
                    onChange={(e) =>
                      set(
                        "minSpendPerVisit",
                        e.target.value.replace(/[^\d.]/g, ""),
                      )
                    }
                    placeholder="e.g. 1000"
                    className="mt-2 h-11 rounded-xl bg-white"
                  />
                </div>
              </div>
            )}

            {(state.ruleMode === "SPEND" || state.ruleMode === "BOTH") && (
              <div className="rounded-xl border border-primary-green-300/30 bg-primary-green-500 p-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                  Total spend target
                </label>
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
          </div>
        )}

        {step === "Time" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                Time Requirement
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                Must customers complete the streak within a certain time period?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {TIME_LIMITS.map((limit) => (
                <OptionRow
                  key={limit.value}
                  selected={state.timeLimitDays === limit.value}
                  icon={limit.icon}
                  title={limit.title}
                  text={limit.text}
                  onSelect={() => set("timeLimitDays", limit.value)}
                />
              ))}
            </div>
            {state.timeLimitDays === -1 && (
              <Input
                value={state.customDays}
                inputMode="numeric"
                onChange={(e) =>
                  set("customDays", e.target.value.replace(/\D/g, ""))
                }
                placeholder="Number of days"
                className="h-11 rounded-xl"
              />
            )}
          </div>
        )}

        {step === "Expiry" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                If they don&apos;t complete in time...
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                What happens when a customer runs out of time to complete the
                streak?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {TIMEOUT_ACTIONS.map((action) => (
                <OptionRow
                  key={action.value}
                  selected={state.timeoutAction === action.value}
                  icon={action.icon}
                  title={action.title}
                  text={action.text}
                  onSelect={() => set("timeoutAction", action.value)}
                />
              ))}
            </div>
          </div>
        )}

        {step === "Notify" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                Keep customers in the loop
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                Choose which messages this programme sends automatically.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {NOTIFICATIONS.map((notification) => {
                const on = state[notification.key];
                return (
                  <button
                    key={notification.key}
                    type="button"
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
            {!state.notify_welcome &&
              !state.notify_progress &&
              !state.notify_reward_ready &&
              !state.notify_expiry_reminder && (
                <p className="rounded-xl bg-warning-2 px-3 py-2 text-[11px] font-medium text-warning-1">
                  No notifications will be sent — customers will have to track
                  their own progress.
                </p>
              )}
          </div>
        )}

        {step === "Review" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-extrabold text-grey-1">
                Review &amp; Submit
              </h3>
              <p className="mt-1 text-xs text-grey-3">
                Confirm everything, then submit to create your programme and
                generate the QR card.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-grey-5">
              {[
                { label: "Business", value: state.businessName || "—" },
                { label: "Programme", value: state.name || "—" },
                {
                  label: "Goal",
                  value:
                    GOALS.find((g) => g.value === state.goal)?.title ?? "—",
                },
                {
                  label: "Reward",
                  value: `${
                    REWARDS.find((r) => r.value === state.rewardType)?.title
                  }${state.rewardValue ? ` — ${state.rewardValue}` : ""}`,
                },
                {
                  label: "Style",
                  value:
                    STYLES.find((s) => s.value === state.rewardStyle)?.title ??
                    "—",
                },
                {
                  label: "Rule",
                  value:
                    state.ruleMode === "SPEND"
                      ? `Spend ${state.spendThreshold || 0}`
                      : `${state.visits} visits`,
                },
                {
                  label: "Time Limit",
                  value:
                    state.timeLimitDays === 0
                      ? "No limit"
                      : state.timeLimitDays === -1
                        ? `${state.customDays || 0} days`
                        : `${state.timeLimitDays} days`,
                },
                {
                  label: "If Expired",
                  value:
                    TIMEOUT_ACTIONS.find((a) => a.value === state.timeoutAction)
                      ?.title ?? "—",
                },
                {
                  label: "Notifications",
                  value: `${
                    [
                      state.notify_welcome,
                      state.notify_progress,
                      state.notify_reward_ready,
                      state.notify_expiry_reminder,
                    ].filter(Boolean).length
                  } messages enabled`,
                },
              ].map((row) => (
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                Streak Preview
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {Array.from({ length: Math.min(state.visits, 10) }, (_, i) => (
                  <div key={i} className="text-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-green-500 text-xs font-extrabold text-primary-green-300">
                      {i + 1}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-grey-4">
                      Visit {i + 1}
                    </span>
                  </div>
                ))}
                <div className="text-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-green-300 text-sm">
                    🎁
                  </span>
                  <span className="mt-0.5 block text-[9px] text-grey-4">
                    Reward
                  </span>
                </div>
              </div>
            </div>

            <p className="rounded-xl bg-warning-2 px-3 py-2.5 text-[11px] leading-relaxed text-warning-1">
              💡 After submitting, you&apos;ll choose a QR card design your
              customers can scan to join.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs font-medium text-error-1">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 gap-3 border-t border-grey-5 pt-4">
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={() => (stepIndex === 0 ? onDone() : setStepIndex(stepIndex - 1))}
        >
          {stepIndex === 0 ? "Cancel" : "← Back"}
        </Button>

        {step === "Review" ? (
          <Button
            className="h-11 flex-1 gap-2 rounded-xl"
            disabled={isPending}
            onClick={submit}
          >
            {isPending && <Spinner className="h-4 w-4" />}
            Submit
          </Button>
        ) : (
          <Button className="h-11 flex-1 rounded-xl" onClick={next}>
            Continue → {STEPS[stepIndex + 1]}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateLoyaltyWizard;
