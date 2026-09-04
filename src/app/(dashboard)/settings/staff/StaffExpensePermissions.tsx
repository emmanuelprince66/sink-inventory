"use client";

import {
  useFetchAttendantPermissionsQuery,
  useUpdateAttendantPermissionsMutation,
} from "@/api/attendants/attendant-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  DAILY_BELOW_PER_TRANSACTION_MESSAGE,
  dailyBelowPerTransaction,
  type AttendantPermissions,
  type AttendantPermissionsResponse,
} from "@/types/expense-governance";
import { getCurrencySymbol } from "@/utils/formatMoney";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * What one staff member may do with expense payouts.
 *
 * The approval cap is the part worth reading twice: it does not stop them
 * approving, it decides where an approval goes. Anything above it escalates to
 * the owner rather than failing, which is the behaviour the caption spells out
 * — an owner who reads it as a hard block will set it far too high.
 */

const Row = ({
  title,
  caption,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  caption: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl border border-grey-5 p-4">
    <div className="min-w-0">
      <p className="text-sm font-bold text-grey-1">{title}</p>
      <p className="mt-1 text-xs text-grey-3">{caption}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </div>
);

const CapField = ({
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
        inputMode={prefix ? "decimal" : "numeric"}
        disabled={disabled}
        onChange={(e) =>
          onChange(
            prefix
              ? e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")
              : e.target.value.replace(/\D/g, ""),
          )
        }
        placeholder="No limit"
        className={cn("h-11 rounded-xl", prefix && "pl-9")}
      />
    </div>
    <p className="mt-1.5 text-xs text-grey-4">{hint}</p>
  </div>
);

const StaffExpensePermissions = ({
  attendantId,
}: {
  attendantId: string;
}) => {
  const symbol = getCurrencySymbol();

  const { data, isLoading } = useFetchAttendantPermissionsQuery({
    params: { id: attendantId },
  });

  const { mutate: save, isPending } = useUpdateAttendantPermissionsMutation();

  /**
   * The integration doc and the OpenAPI schema disagree about this response.
   *
   * The doc shows `{ role, permissions: { ... } }`; the schema's UserPermission
   * is a bare object with the flags at the top level and no role at all. The
   * endpoint currently 500s, so neither can be confirmed against a real
   * response — this reads whichever arrives rather than betting on one and
   * silently showing every toggle as off if the other turns up.
   */
  const payload: AttendantPermissionsResponse | undefined = data?.data;
  const permissions = payload?.permissions ?? (payload as any);

  const [canLog, setCanLog] = useState(false);
  const [canInitiate, setCanInitiate] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [cap, setCap] = useState("");
  const [spendCap, setSpendCap] = useState("");
  const [dailySpend, setDailySpend] = useState("");
  const [dailyCount, setDailyCount] = useState("");
  const [error, setError] = useState("");

  // Blank rather than "0" for an unset cap — 0 is a real setting here and must
  // not be conjured out of a null.
  const asAmount = (value: string | null | undefined) =>
    value == null ? "" : String(Number(value));

  useEffect(() => {
    if (!permissions) return;
    setCanLog(Boolean(permissions.can_log_expenses));
    setCanInitiate(Boolean(permissions.can_initiate_expense_transfer));
    setCanApprove(Boolean(permissions.can_approve_expenses));
    setCap(asAmount(permissions.max_expense_approval_amount));
    setSpendCap(asAmount(permissions.max_expense_transfer_amount));
    setDailySpend(asAmount(permissions.daily_expense_transfer_limit));
    setDailyCount(
      permissions.daily_expense_transaction_limit == null
        ? ""
        : String(permissions.daily_expense_transaction_limit),
    );
  }, [permissions]);

  // Null rather than "0.00" for a blank field: 0 is a real cap meaning "may
  // spend nothing", where blank means "fall back to the business ceiling".
  const amountOrNull = (value: string) =>
    value.trim() ? (Number(value) || 0).toFixed(2) : null;

  const handleSave = () => {
    if (dailyBelowPerTransaction(dailySpend, spendCap)) {
      setError(DAILY_BELOW_PER_TRANSACTION_MESSAGE);
      return;
    }
    setError("");

    const body: AttendantPermissions = {
      can_log_expenses: canLog,
      can_initiate_expense_transfer: canInitiate,
      can_approve_expenses: canApprove,
      max_expense_transfer_amount: amountOrNull(spendCap),
      daily_expense_transfer_limit: amountOrNull(dailySpend),
      daily_expense_transaction_limit: dailyCount.trim()
        ? Number(dailyCount) || 0
        : null,
      max_expense_approval_amount: amountOrNull(cap),
    };

    save({ id: attendantId, body });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold text-grey-1">Expense payouts</p>
          <p className="mt-1 text-sm text-grey-3">
            What this staff member can do with money leaving an expense
            account.
          </p>
        </div>
        {payload?.role && (
          <span className="mt-1 shrink-0 rounded-full bg-grey-6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-grey-3">
            {payload.role.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <Row
          title="Can log expenses"
          caption="Lets them record money already spent, like a cash receipt."
          checked={canLog}
          onChange={setCanLog}
          disabled={isPending}
        />

        <Row
          title="Can start a transfer"
          caption="Lets them request a payout from an expense account."
          checked={canInitiate}
          onChange={setCanInitiate}
          disabled={isPending}
        />

        <Row
          title="Can approve transfers"
          caption="Lets them release someone else's request."
          checked={canApprove}
          onChange={setCanApprove}
          disabled={isPending}
        />

        {/* Spending caps cover logging and transfers together, so they show as
            soon as either is on — capping only transfers would leave the other
            door open. */}
        {(canLog || canInitiate) && (
          <div className="rounded-2xl border border-grey-5 p-4">
            <p className="text-sm font-bold text-grey-1">
              What they may spend
            </p>
            <p className="mt-1 mb-4 text-xs text-grey-3">
              Logging an expense and sending a payout draw on the same daily
              allowance — a receipt recorded in the morning leaves that much
              less to transfer in the afternoon. Leave a field blank to fall
              back to the business limit.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <CapField
                label="Most per transaction"
                prefix={symbol}
                value={spendCap}
                onChange={setSpendCap}
                disabled={isPending}
                hint="The largest single expense or payout."
              />
              <CapField
                label="Most per day"
                prefix={symbol}
                value={dailySpend}
                onChange={setDailySpend}
                disabled={isPending}
                hint="Total across everything they do in a day."
              />
              <CapField
                label="Transactions per day"
                value={dailyCount}
                onChange={setDailyCount}
                disabled={isPending}
                hint="How many expense actions, logged and sent together."
              />
            </div>
          </div>
        )}

        {/* Only meaningful once they can approve at all. Deliberately separate
            from the spending caps above: approving is oversight, not spending,
            and the two are set independently — an accountant can be trusted to
            sign off far more than they may send themselves. */}
        {canApprove && (
          <div className="rounded-2xl border border-grey-5 p-4">
            <p className="text-sm font-bold text-grey-1">What they may approve</p>
            <p className="mt-1 mb-4 text-xs text-grey-3">
              Separate from their own spending limit above.
            </p>

            <div className="max-w-xs">
              <CapField
                label="Approval cap"
                prefix={symbol}
                value={cap}
                onChange={setCap}
                disabled={isPending}
                hint=""
              />
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 text-xs text-grey-4">
              <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Requests above this go to the owner instead of being refused.
                Leave it blank for no cap. They can never approve a request
                they started themselves, whatever this is set to.
              </span>
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 text-xs font-bold text-error-1">{error}</p>
      )}

      {/* Sits on the section, not inside a card of its own — a bordered box
          holding nothing but a button reads as another setting. */}
      <Button
        onClick={handleSave}
        disabled={isPending || !attendantId}
        className="mt-6 h-[48px] w-full"
      >
        {isPending ? <Spinner className="mr-2" size="sm" /> : "Save permissions"}
      </Button>
    </div>
  );
};

export default StaffExpensePermissions;
