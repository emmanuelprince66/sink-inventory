"use client";

import {
  useFetchExpenseSettingsQuery,
  useUpdateExpenseSettingsMutation,
} from "@/api/expenses/expense-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import type {
  ExpenseSettings,
  ExpenseSettingsUpdate,
} from "@/types/expense-governance";
import { getCurrencySymbol } from "@/utils/formatMoney";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * The owner's spending controls for expense payouts.
 *
 * Every field here is a ceiling, and zero means "no ceiling" rather than
 * "nothing allowed" — an easy thing to get backwards, so each input says so
 * under itself and an empty box is sent as 0 rather than being left out.
 */

/** Digits and at most one decimal point. */
const money = (raw: string) =>
  raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

const digits = (raw: string) => raw.replace(/\D/g, "");

const LimitField = ({
  label,
  hint,
  prefix,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <div>
    <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
      {label}
    </label>
    <div className="relative mt-2">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-grey-3">
          {prefix}
        </span>
      )}
      <Input
        value={value}
        inputMode="decimal"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`h-11 rounded-xl ${prefix ? "pl-9" : ""}`}
      />
    </div>
    <p className="mt-1.5 text-xs text-grey-4">{hint}</p>
  </div>
);

const ExpenseGovernance = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const symbol = getCurrencySymbol();

  const { data, isLoading } = useFetchExpenseSettingsQuery({
    params: { id: business_id },
  });

  const { mutate: save, isPending } = useUpdateExpenseSettingsMutation();

  const settings: ExpenseSettings | undefined = data?.data;

  const [maxPerTransaction, setMaxPerTransaction] = useState("");
  const [dailyTransferLimit, setDailyTransferLimit] = useState("");
  const [dailyTransactionLimit, setDailyTransactionLimit] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);

  // Seeded from the server rather than held as the source of truth, so a
  // refetch after saving does not fight what is on screen.
  useEffect(() => {
    if (!settings) return;
    setMaxPerTransaction(String(Number(settings.max_amount_per_transaction ?? 0)));
    setDailyTransferLimit(String(Number(settings.daily_transfer_limit ?? 0)));
    setDailyTransactionLimit(String(settings.daily_transaction_limit ?? 0));
    setRequireApproval(Boolean(settings.require_approval_for_all));
  }, [settings]);

  const handleSave = () => {
    if (!business_id) return;

    const body: ExpenseSettingsUpdate = {
      // Sent as fixed decimals: the API takes these as decimal strings, and
      // "50000" and "" both need to arrive as a number it can parse.
      max_amount_per_transaction: (Number(maxPerTransaction) || 0).toFixed(2),
      daily_transfer_limit: (Number(dailyTransferLimit) || 0).toFixed(2),
      daily_transaction_limit: Number(dailyTransactionLimit) || 0,
      require_approval_for_all: requireApproval,
    };

    save({ id: business_id, body });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Header — same shape as the Tax and Bank settings screens. */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-grey-1 sm:text-2xl">
            Expense Controls
          </h1>
          <p className="mt-1 text-sm text-grey-3">
            Ceilings for money leaving an expense account, and who has to sign
            it off
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-grey-1">
              Spending limits
            </h2>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-primary-green-300/35 bg-primary-green-500 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-green-300" />
            <p className="text-xs text-grey-3">
              Leave a limit at <span className="font-bold">0</span> to not
              enforce it. Zero means unlimited here, not blocked.
            </p>
          </div>

          <div className="rounded-2xl border border-grey-5 bg-white p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <LimitField
                label="Max per transaction"
                prefix={symbol}
                value={maxPerTransaction}
                onChange={(v) => setMaxPerTransaction(money(v))}
                disabled={isPending}
                hint="The largest single payout anyone can send."
              />
              <LimitField
                label="Daily transfer limit"
                prefix={symbol}
                value={dailyTransferLimit}
                onChange={(v) => setDailyTransferLimit(money(v))}
                disabled={isPending}
                hint="Total that can leave in one day, across everyone."
              />
              <LimitField
                label="Transfers per day"
                value={dailyTransactionLimit}
                onChange={(v) => setDailyTransactionLimit(digits(v))}
                disabled={isPending}
                hint="How many payouts can be made in one day."
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-grey-1">Approvals</h2>

          <div className="flex items-start justify-between gap-4 rounded-2xl border border-grey-5 bg-white p-5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-grey-1">
                Approval required for staff payouts
              </p>
              <p className="mt-1 text-xs text-grey-3">
                On, a staff transfer waits for an approver even when it is
                within the limits. Off, it goes out as soon as the sender
                enters their PIN.
              </p>
              {/* The owner is the top authority and this switch does not gate
                  them — saying so here stops it being read as a lock on the
                  whole business. */}
              <p className="mt-1.5 text-xs text-grey-4">
                This does not hold up the owner: an owner&apos;s PIN releases a
                payout straight away, as long as it is within the limits above.
              </p>
            </div>
            <Switch
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
              disabled={isPending}
            />
          </div>
        </section>

        <Button
          onClick={handleSave}
          disabled={isPending || !business_id}
          className="h-[48px] w-full sm:w-auto sm:min-w-[200px]"
        >
          {isPending ? <Spinner className="mr-2" size="sm" /> : "Save controls"}
        </Button>
      </div>
    </div>
  );
};

export default ExpenseGovernance;
