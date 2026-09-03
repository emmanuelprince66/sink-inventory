"use client";

import {
  useFetchAttendantPermissionsQuery,
  useUpdateAttendantPermissionsMutation,
} from "@/api/attendants/attendant-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type {
  AttendantPermissions,
  AttendantPermissionsResponse,
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

  const [canInitiate, setCanInitiate] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [cap, setCap] = useState("");

  useEffect(() => {
    if (!permissions) return;
    setCanInitiate(Boolean(permissions.can_initiate_expense_transfer));
    setCanApprove(Boolean(permissions.can_approve_expenses));
    setCap(
      permissions.max_expense_approval_amount == null
        ? ""
        : String(Number(permissions.max_expense_approval_amount)),
    );
  }, [permissions]);

  const handleSave = () => {
    const body: AttendantPermissions = {
      can_initiate_expense_transfer: canInitiate,
      can_approve_expenses: canApprove,
      // Null rather than "0.00" for an empty cap: 0 would read as a cap of
      // zero, escalating every single approval, where blank means none set.
      max_expense_approval_amount: cap.trim()
        ? (Number(cap) || 0).toFixed(2)
        : null,
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

        {/* Only meaningful once they can approve at all. */}
        {canApprove && (
          <div className="rounded-2xl border border-grey-5 p-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
              Approval cap
            </label>
            <div className="relative mt-2 max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-grey-3">
                {symbol}
              </span>
              <Input
                value={cap}
                inputMode="decimal"
                disabled={isPending}
                onChange={(e) =>
                  setCap(
                    e.target.value
                      .replace(/[^\d.]/g, "")
                      .replace(/(\..*)\./g, "$1"),
                  )
                }
                placeholder="No cap"
                className="h-11 rounded-xl pl-9"
              />
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 text-xs text-grey-4">
              <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Requests above this go to the owner instead of being refused.
                Leave it blank for no cap.
              </span>
            </p>
          </div>
        )}
      </div>

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
