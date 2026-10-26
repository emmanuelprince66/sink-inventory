"use client";

import { Button } from "@/components/ui/button";
import {
  BookingPolicy,
  ServiceScheduleDay,
  getBookingPolicy,
  getServiceScheduleDays,
  useBookingPolicyQuery,
  useSaveBookingPolicyMutation,
  useSaveServiceScheduleMutation,
  useServiceScheduleQuery,
} from "@/api/bookings/service-bookings";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/toast/useToast";
import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import BookingPageHeader from "../BookingPageHeader";

const INTERVALS = [15, 30, 45, 60] as const;
const NOTICE_OPTIONS = [0, 1, 2, 4, 12, 24] as const;
const ADVANCE_OPTIONS = [7, 14, 30, 60, 90] as const;
// 0 means no cancellations are permitted (backend semantics).
const CANCELLATION_OPTIONS = [0, 2, 24, 48, 72] as const;
const DEFAULT_MIN_DEPOSIT_PERCENTAGE = 30;

// The merchant picks exactly one payment option; the API still stores three
// booleans, so a choice is written as one true and two false.
type PaymentChoice = "allow_full_payment" | "allow_deposit" | "allow_pay_at_business";
const PAYMENT_OPTIONS: { key: PaymentChoice; title: string; description: string }[] = [
  {
    key: "allow_full_payment",
    title: "Full Payment",
    description: "Customer pays the full amount at booking.",
  },
  {
    key: "allow_deposit",
    title: "Deposit",
    description: "Collect a partial deposit to secure the slot.",
  },
  {
    key: "allow_pay_at_business",
    title: "Pay at Business",
    description: "Customer pays on arrival. No online payment required.",
  },
];
// Older settings may have several enabled; show the first in this order.
const getPaymentChoice = (policy: BookingPolicy): PaymentChoice =>
  PAYMENT_OPTIONS.find(({ key }) => policy[key])?.key ?? "allow_full_payment";
const paymentChoiceFlags = (choice: PaymentChoice) => ({
  allow_full_payment: choice === "allow_full_payment",
  allow_deposit: choice === "allow_deposit",
  allow_pay_at_business: choice === "allow_pay_at_business",
});
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_SCHEDULE: ServiceScheduleDay[] = DAYS.map((_, day_of_week) => ({
  day_of_week,
  is_closed: day_of_week === 6,
  open_time: "09:00",
  close_time: "18:00",
  breaks: [],
}));
const DEFAULT_POLICY: BookingPolicy = {
  booking_interval: 30,
  min_notice_hours: 2,
  max_advance_days: 30,
  cancellation_window_hours: 2,
  allow_full_payment: true,
  allow_deposit: false,
  allow_pay_at_business: false,
  min_deposit_percentage: DEFAULT_MIN_DEPOSIT_PERCENTAGE,
  is_deposit_non_refundable: false,
  custom_policy_text: "",
};

const AvailabilityPage = () => {
  const { showToast } = useToast();
  const businessId = useBusinessStore((state) => state.business_id);
  const { data: scheduleResponse, isLoading: scheduleLoading, error: scheduleError, refetch: refetchSchedule } =
    useServiceScheduleQuery(businessId ?? "");
  const { data: policyResponse, isLoading: policyLoading, error: policyError, refetch: refetchPolicy } =
    useBookingPolicyQuery(businessId ?? "");
  const { mutateAsync: saveSchedule, isPending: savingSchedule } =
    useSaveServiceScheduleMutation();
  const { mutateAsync: savePolicy, isPending: savingPolicy } =
    useSaveBookingPolicyMutation();
  const [schedule, setSchedule] = useState<ServiceScheduleDay[]>(DEFAULT_SCHEDULE);
  const [policy, setPolicy] = useState<BookingPolicy>(DEFAULT_POLICY);
  // Kept as text so the field can be cleared while typing.
  const [depositPercentInput, setDepositPercentInput] = useState(
    String(DEFAULT_MIN_DEPOSIT_PERCENTAGE),
  );

  useEffect(() => {
    const loaded = getServiceScheduleDays(scheduleResponse);
    if (loaded.length) {
      setSchedule(
        DEFAULT_SCHEDULE.map(
          (fallback) =>
            loaded.find((day) => day.day_of_week === fallback.day_of_week) ??
            fallback,
        ),
      );
    }
  }, [scheduleResponse]);

  useEffect(() => {
    const loaded = getBookingPolicy(policyResponse);
    if (loaded) {
      setPolicy({ ...DEFAULT_POLICY, ...loaded });
      setDepositPercentInput(
        String(loaded.min_deposit_percentage ?? DEFAULT_MIN_DEPOSIT_PERCENTAGE),
      );
    }
  }, [policyResponse]);

  const updatePolicy = (update: Partial<BookingPolicy>) => {
    setPolicy((current) => ({ ...current, ...update }));
  };

  const updateDay = (dayIndex: number, update: Partial<ServiceScheduleDay>) => {
    setSchedule((current) =>
      current.map((day) =>
        day.day_of_week === dayIndex ? { ...day, ...update } : day,
      ),
    );
  };

  const updateBreak = (
    dayIndex: number,
    breakIndex: number,
    update: Partial<ServiceScheduleDay["breaks"][number]>,
  ) => {
    setSchedule((current) =>
      current.map((day) =>
        day.day_of_week === dayIndex
          ? {
              ...day,
              breaks: day.breaks.map((breakItem, index) =>
                index === breakIndex ? { ...breakItem, ...update } : breakItem,
              ),
            }
          : day,
      ),
    );
  };

  const addBreak = (dayIndex: number) => {
    setSchedule((current) =>
      current.map((day) =>
        day.day_of_week === dayIndex
          ? {
              ...day,
              breaks: [
                ...day.breaks,
                { name: "Break", start_time: "13:00", end_time: "14:00" },
              ],
            }
          : day,
      ),
    );
  };

  const removeBreak = (dayIndex: number, breakIndex: number) => {
    setSchedule((current) =>
      current.map((day) =>
        day.day_of_week === dayIndex
          ? {
              ...day,
              breaks: day.breaks.filter((_, index) => index !== breakIndex),
            }
          : day,
      ),
    );
  };

  const updateDraft = (update: Partial<BookingPolicy>) => {
    updatePolicy(update);
  };

  const handleSave = async () => {
    if (!businessId) {
      showToast("Select a business before changing availability.", "error");
      return;
    }
    const minDepositPercentage = Number(depositPercentInput);
    if (
      !Number.isInteger(minDepositPercentage) ||
      minDepositPercentage < 1 ||
      minDepositPercentage > 100
    ) {
      showToast("Enter a default deposit between 1% and 100%.", "error");
      return;
    }
    try {
      await Promise.all([
        saveSchedule({ businessId, schedules: schedule }),
        savePolicy({
          businessId,
          payload: {
            ...policy,
            ...paymentChoiceFlags(getPaymentChoice(policy)),
            min_deposit_percentage: minDepositPercentage,
            custom_policy_text: policy.custom_policy_text?.trim() || null,
          },
        }),
      ]);
      showToast("Payment and availability settings saved.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not save availability.",
        "error",
      );
    }
  };

  const loading = scheduleLoading || policyLoading;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <BookingPageHeader title="Payment & availability" />

      {(scheduleError || policyError) && (
        <div className="flex flex-col gap-3 rounded-xl border border-error-1/20 bg-error-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-error-1">
            Could not load all booking availability settings.
          </p>
          <div className="flex gap-2">
            {scheduleError && (
              <Button type="button" size="sm" variant="outline" onClick={() => refetchSchedule()}>
                Retry schedule
              </Button>
            )}
            {policyError && (
              <Button type="button" size="sm" variant="outline" onClick={() => refetchPolicy()}>
                Retry policies
              </Button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <AvailabilitySkeleton />
      ) : (
        <>
          <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="font-extrabold text-grey-1">Weekly Schedule</h2>
            </div>
            <div className="space-y-3">
              {schedule.map((day) => (
                <div
                  key={day.day_of_week}
                  className={`grid grid-cols-1 gap-4 rounded-xl border p-4 transition-colors sm:grid-cols-[minmax(110px,0.55fr)_minmax(0,1.8fr)_auto] sm:items-start sm:gap-5 ${
                    day.is_closed
                      ? "border-grey-5 bg-grey-6/50"
                      : "border-grey-5 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 sm:pt-1">
                    <div>
                      <p className={`text-sm font-bold ${day.is_closed ? "text-grey-3" : "text-grey-1"}`}>
                        {DAYS[day.day_of_week]}
                      </p>
                      <p className={`mt-0.5 text-xs ${day.is_closed ? "text-grey-3" : "text-primary-green-300"}`}>
                        {day.is_closed ? "Closed" : "Open for bookings"}
                      </p>
                    </div>
                    <Switch
                      checked={!day.is_closed}
                      onCheckedChange={(isOpen) =>
                        updateDay(day.day_of_week, { is_closed: !isOpen })
                      }
                      aria-label={`Set ${DAYS[day.day_of_week]} ${
                        day.is_closed ? "open" : "closed"
                      }`}
                      className="sm:hidden"
                    />
                  </div>
                  <div className="space-y-3">
                    {!day.is_closed ? (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="time"
                            value={day.open_time}
                            onChange={(event) =>
                              updateDay(day.day_of_week, { open_time: event.target.value })
                            }
                            aria-label={`${DAYS[day.day_of_week]} opening time`}
                            className="h-9 rounded-lg border border-grey-5 bg-white px-2 text-sm text-grey-1"
                          />
                          <span className="text-grey-3">to</span>
                          <input
                            type="time"
                            value={day.close_time}
                            onChange={(event) =>
                              updateDay(day.day_of_week, { close_time: event.target.value })
                            }
                            aria-label={`${DAYS[day.day_of_week]} closing time`}
                            className="h-9 rounded-lg border border-grey-5 bg-white px-2 text-sm text-grey-1"
                          />
                        </div>
                        {day.breaks.map((breakItem, breakIndex) => (
                          <div
                            key={`${day.day_of_week}-break-${breakIndex}`}
                            className="grid gap-2 rounded-lg bg-grey-6 p-3 sm:grid-cols-[minmax(120px,1fr)_auto_auto_auto]"
                          >
                            <input
                              value={breakItem.name}
                              onChange={(event) =>
                                updateBreak(day.day_of_week, breakIndex, { name: event.target.value })
                              }
                              aria-label={`${DAYS[day.day_of_week]} break name`}
                              className="h-9 min-w-0 rounded-lg border border-grey-5 bg-white px-2 text-sm"
                            />
                            <input
                              type="time"
                              value={breakItem.start_time}
                              onChange={(event) =>
                                updateBreak(day.day_of_week, breakIndex, { start_time: event.target.value })
                              }
                              aria-label={`${DAYS[day.day_of_week]} break start`}
                              className="h-9 rounded-lg border border-grey-5 bg-white px-2 text-sm"
                            />
                            <input
                              type="time"
                              value={breakItem.end_time}
                              onChange={(event) =>
                                updateBreak(day.day_of_week, breakIndex, { end_time: event.target.value })
                              }
                              aria-label={`${DAYS[day.day_of_week]} break end`}
                              className="h-9 rounded-lg border border-grey-5 bg-white px-2 text-sm"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              aria-label="Remove break"
                              onClick={() => removeBreak(day.day_of_week, breakIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addBreak(day.day_of_week)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add break
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-grey-3">Closed</span>
                    )}
                  </div>
                  <div className="hidden items-center sm:flex sm:justify-self-end">
                    <Switch
                      checked={!day.is_closed}
                      onCheckedChange={(isOpen) =>
                        updateDay(day.day_of_week, { is_closed: !isOpen })
                      }
                      aria-label={`Set ${DAYS[day.day_of_week]} ${
                        day.is_closed ? "open" : "closed"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
            <h2 className="font-extrabold text-grey-1">Booking Interval</h2>
            <p className="mb-3 mt-1 text-xs text-grey-3">
              How often should time slots appear for booking?
            </p>
            <div
              role="radiogroup"
              aria-label="Booking interval"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {INTERVALS.map((interval) => {
                const selected = policy.booking_interval === interval;
                return (
                  <button
                    key={interval}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateDraft({ booking_interval: interval })}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                      selected
                        ? "border-primary-green-300 bg-secondary-6 text-grey-1"
                        : "border-grey-5 text-grey-2 hover:bg-grey-6"
                    }`}
                  >
                    <RadioDot selected={selected} />
                    {interval} min
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
            <h2 className="mb-4 font-extrabold text-grey-1">Booking Rules</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberSelect
                label="Minimum Booking Notice"
                value={policy.min_notice_hours}
                options={NOTICE_OPTIONS.map((value) => ({
                  value,
                  label: value === 0 ? "No minimum" : `${value} hour${value > 1 ? "s" : ""}`,
                }))}
                onChange={(value) => updateDraft({ min_notice_hours: value })}
              />
              <NumberSelect
                label="How Far Ahead Can Customers Book?"
                value={policy.max_advance_days}
                options={ADVANCE_OPTIONS.map((value) => ({
                  value,
                  label: `${value} days`,
                }))}
                onChange={(value) => updateDraft({ max_advance_days: value })}
              />
              <NumberSelect
                label="Cancellation Window"
                value={policy.cancellation_window_hours}
                options={CANCELLATION_OPTIONS.map((value) => ({
                  value,
                  label: value === 0 ? "No cancellations" : `${value} hours before appointment`,
                }))}
                onChange={(value) =>
                  updateDraft({ cancellation_window_hours: value })
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
            <h2 className="mb-4 font-extrabold text-grey-1">Payment Options</h2>
            <div role="radiogroup" aria-label="Payment options" className="grid gap-3">
              {PAYMENT_OPTIONS.map((option) => {
                const selected = getPaymentChoice(policy) === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => updateDraft(paymentChoiceFlags(option.key))}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? "border-primary-green-300 bg-secondary-6/70 shadow-sm"
                        : "border-grey-5 bg-white hover:border-grey-4 hover:bg-grey-6"
                    }`}
                  >
                    <span className="mt-0.5">
                      <RadioDot selected={selected} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-grey-1">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-grey-3">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {getPaymentChoice(policy) === "allow_deposit" && (
              <div className="mt-4 grid gap-4 rounded-xl border border-grey-5 bg-grey-6/50 p-4 sm:grid-cols-2 sm:items-start">
                <label className="block space-y-1.5 text-sm font-semibold text-grey-2">
                  Default deposit (%)
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={depositPercentInput}
                    onChange={(event) =>
                      setDepositPercentInput(event.target.value)
                    }
                    className="h-10 bg-white"
                  />
                  <span className="block text-xs font-normal text-grey-3">
                    Used when a service doesn&apos;t set its own minimum
                    deposit.
                  </span>
                </label>
                <div className="flex items-start justify-between gap-3 sm:pt-6">
                  <span>
                    <span className="block text-sm font-semibold text-grey-2">
                      Non-refundable deposit
                    </span>
                    <span className="mt-0.5 block text-xs text-grey-3">
                      Customers lose their deposit when they cancel.
                    </span>
                  </span>
                  <Switch
                    checked={Boolean(policy.is_deposit_non_refundable)}
                    onCheckedChange={(checked) =>
                      updateDraft({ is_deposit_non_refundable: checked })
                    }
                    aria-label="Make deposits non-refundable"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
            <h2 className="mb-1 font-extrabold text-grey-1">
              Additional policy terms
            </h2>
            <p className="mb-4 text-xs text-grey-3">
              Optional. Shown to customers with your booking policy before they
              pay, e.g. a late-arrival grace period.
            </p>
            <Textarea
              value={policy.custom_policy_text ?? ""}
              onChange={(event) =>
                updateDraft({ custom_policy_text: event.target.value })
              }
              placeholder="A 15-minute grace period is allowed for late arrivals."
              rows={4}
              aria-label="Additional policy terms"
            />
          </section>
        </>
      )}

      <Button
        type="button"
        onClick={handleSave}
        disabled={loading || savingSchedule || savingPolicy || Boolean(scheduleError || policyError)}
        className="w-full sm:w-auto"
      >
        <Check className="h-4 w-4" />
        {savingSchedule || savingPolicy ? "Saving..." : "Save settings"}
      </Button>
    </div>
  );
};

const AvailabilitySkeleton = () => (
  <>
    <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
      <Skeleton className="h-5 w-36 bg-grey-6" />
      <Skeleton className="mt-2 h-3 w-60 bg-grey-6" />
      <div className="mt-4 space-y-3">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-between gap-4 rounded-xl border border-grey-5 p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-grey-6" />
              <Skeleton className="h-3 w-28 bg-grey-6" />
            </div>
            <Skeleton className="hidden h-9 w-64 rounded-lg bg-grey-6 sm:block" />
            <Skeleton className="h-5 w-9 rounded-full bg-grey-6" />
          </div>
        ))}
      </div>
    </section>
    {[4, 3, 3, 1].map((count, index) => (
      <section
        key={index}
        className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6"
      >
        <Skeleton className="h-5 w-40 bg-grey-6" />
        <div
          className={`mt-4 grid gap-3 ${count === 4 ? "grid-cols-2 sm:grid-cols-4" : count === 3 ? "sm:grid-cols-3" : ""}`}
        >
          {Array.from({ length: count }).map((_, item) => (
            <Skeleton key={item} className="h-11 rounded-xl bg-grey-6" />
          ))}
        </div>
      </section>
    ))}
  </>
);

const RadioDot = ({ selected }: { selected: boolean }) => (
  <span
    aria-hidden
    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
      selected ? "border-primary-green-300" : "border-grey-4 bg-white"
    }`}
  >
    {selected && <span className="h-2 w-2 rounded-full bg-primary-green-300" />}
  </span>
);

const NumberSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
}) => (
  <label className="space-y-1.5 text-sm font-semibold text-grey-2">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-10 w-full cursor-pointer rounded-lg border border-grey-5 bg-white px-3 text-sm font-normal text-grey-1 outline-none focus:border-primary-green-300"
    >
      {(options.some((option) => option.value === value)
        ? options
        : [...options, { value, label: `${value} (current)` }]
      ).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export default AvailabilityPage;
