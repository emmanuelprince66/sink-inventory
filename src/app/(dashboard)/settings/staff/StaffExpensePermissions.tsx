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
        <p className="text-lg font-extrabold text-grey-1">
          Employee Expense Access
        </p>
        {payload?.role && (
          <span className="mt-1 shrink-0 rounded-full bg-grey-6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-grey-3">
            {payload.role.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <p className="text-sm font-extrabold text-grey-1">
            How much can they spend?
          </p>

          <div className="mt-3 grid gap-4 rounded-2xl border border-grey-5 p-4 sm:grid-cols-2">
            <CapField
              label="Maximum per transaction"
              prefix={symbol}
              value={spendCap}
              onChange={setSpendCap}
              disabled={isPending}
              hint="The highest amount they can spend or request in one transaction."
            />
            <CapField
              label="Maximum per day"
              prefix={symbol}
              value={dailySpend}
              onChange={setDailySpend}
              disabled={isPending}
              hint="The total amount they can spend or request in one day."
            />
            <CapField
              label="Daily transaction limit"
              value={dailyCount}
              onChange={setDailyCount}
              disabled={isPending}
              hint="The maximum number of expense transactions they can make in one day."
            />
          </div>
        </section>

        <section>
          <p className="text-sm font-extrabold text-grey-1">
            What can they do?
          </p>

          <div className="mt-3 space-y-3">
            <Row
              title="Log expenses"
              caption="Allow them to record expenses they have already paid for."
              checked={canLog}
              onChange={setCanLog}
              disabled={isPending}
            />

            <Row
              title="Request a payout"
              caption="Allow them to request money from the business for an expense."
              checked={canInitiate}
              onChange={setCanInitiate}
              disabled={isPending}
            />

            <Row
              title="Approve payouts"
              caption="Allow them to approve and release payout requests from other employees."
              checked={canApprove}
              onChange={setCanApprove}
              disabled={isPending}
            />

            {/* Sits under the toggle it belongs to rather than with the limits
                above: what someone may approve is oversight, not spending, and
                the two are set independently — an accountant can sign off far
                more than they are trusted to send themselves. */}
            {canApprove && (
              <div className="rounded-2xl border border-grey-5 p-4">
                <div className="max-w-xs">
                  <CapField
                    label="Approval limit"
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
                    Requests above this go to the owner instead of being
                    refused. Leave it blank for no limit. They can never
                    approve a request they made themselves, whatever this is
                    set to.
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
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
