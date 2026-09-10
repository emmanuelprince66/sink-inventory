"use client";

import { useFetchExpenseSettingsQuery } from "@/api/expenses/expense-settings";
import { useInitiateExpenseTransferMutation } from "@/api/expenses/expense-transfers";
import TransactionPinDialog from "@/components/app/TransactionPinDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useExpensePermissions } from "@/hooks/useExpensePermissions";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import {
  classifyPinFault,
  estimateCharges,
  type ExpenseSettings,
  routeForAmount,
} from "@/types/expense-governance";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowLeft, CheckCircle2, Clock, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * The confirm step for an expense payout.
 *
 * Separate from the wallet's ConfirmTransfer, which still serves /transactions
 * and its business-scoped wallet PIN. This one goes through the expense
 * transfers endpoint, which may execute the payout or queue it for approval —
 * so the screen has to be honest about which of the two is about to happen
 * before the button is pressed, not after.
 */

const Line = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="text-sm text-grey-3">{label}</span>
    <span
      className={`text-right text-sm ${
        strong ? "font-extrabold text-grey-1" : "font-bold text-grey-2"
      }`}
    >
      {value}
    </span>
  </div>
);

const ConfirmExpenseTransfer = ({
  details,
  onCancel,
  onDone,
}: {
  details: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    amount: string;
    narration: string;
    categoryId?: string;
    categoryName?: string;
  };
  onCancel: () => void;
  onDone: () => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { canApprove, transferCap, approvalCap, isOwner } =
    useExpensePermissions();
  const queryClient = useQueryClient();
  const [askingPin, setAskingPin] = useState(false);
  const [outcome, setOutcome] = useState<"SENT" | "QUEUED" | null>(null);

  const { data: settingsData } = useFetchExpenseSettingsQuery({
    params: { id: business_id },
  });
  const settings: ExpenseSettings | undefined = settingsData?.data;

  const amount = Number(details.amount) || 0;
  const charges = estimateCharges(amount);

  // The business ceiling, which binds everyone including the owner. Distinct
  // from the personal limits below: over this, the payout is refused outright
  // rather than queued, because nobody can approve past it.
  const perTransactionCap = Number(settings?.max_amount_per_transaction ?? 0);
  const overCap = perTransactionCap > 0 && amount > perTransactionCap;
  const alwaysNeedsApproval = Boolean(settings?.require_approval_for_all);

  /**
   * Where this payout lands, on the backend's two-metric model.
   *
   * `transferCap` is the direct-payment limit — what this person releases on
   * their own PIN. `approvalCap` is what they may sign off on someone else's
   * request. Between the two, another approver has to sign; above the second,
   * only the owner can.
   *
   * Read off permissions rather than off `role === "OWNER"`: the backend now
   * sends owners the real flags with null ceilings, so the role check was a
   * second source of truth that could only ever drift from it.
   */
  const route = routeForAmount({
    amount,
    canApprove,
    transferCap,
    approvalCap,
  });

  // The business-wide "approval for everything" switch overrides a personal
  // limit that would otherwise let this straight out.
  const expectApproval =
    route !== "EXECUTES" || (alwaysNeedsApproval && !isOwner);
  const needsOwner = route === "NEEDS_OWNER";

  /**
   * Someone who cannot approve, over their own initiation cap.
   *
   * For them `max_expense_transfer_amount` is a hard limit the backend refuses
   * past — unlike an approver, for whom the same number only means "another
   * signature required". Submitting would 400, so it is stopped here with the
   * reason rather than after a PIN and a failed request.
   */
  const overPersonalCap = route === "OVER_LIMIT";
  const blocked = overCap || overPersonalCap;

  const { mutate: initiate, isPending } = useInitiateExpenseTransferMutation({
    onSuccess: (response: any) => {
      const status = response?.data?.data?.status ?? response?.data?.status;
      setAskingPin(false);
      setOutcome(status === "SUCCESS" ? "SENT" : "QUEUED");
    },
    /**
     * The PIN-shaped refusals, handled rather than just toasted.
     *
     * "You have not set your PIN" is not something the person can act on from
     * a toast, so the status query is dropped and the dialog left open — it
     * reads `has_pin` and switches itself to creating one, then carries
     * straight on into the payout. A wrong PIN keeps the dialog open too, so
     * they can retype without rebuilding the whole transfer.
     */
    onError: (error: unknown) => {
      const fault = classifyPinFault(error);

      if (fault === "not-set") {
        queryClient.invalidateQueries({
          queryKey: [queryKey.userPin.status],
        });
        setAskingPin(true);
        return;
      }

      if (fault === "invalid" || fault === "missing") {
        setAskingPin(true);
        return;
      }

      setAskingPin(false);
    },
  });

  /**
   * A PIN is mandatory on every payout now, whether it goes out immediately or
   * queues for approval — the backend refuses the request without one. There
   * is deliberately no path here that submits without it.
   */
  const submit = (pin: string) => {
    if (!business_id) return;

    initiate({
      id: business_id,
      body: {
        // In the body as well as the URL — see InitiateTransferBody. The live
        // route reads it from the path; the one replacing it reads the body.
        business_id,
        amount: amount.toFixed(2),
        account_number: details.accountNumber,
        bank_code: details.bankCode,
        pin,
        ...(details.categoryId ? { category_id: details.categoryId } : {}),
        ...(details.narration ? { narration: details.narration } : {}),
      },
    });
  };

  if (outcome) {
    const sent = outcome === "SENT";

    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-grey-5 bg-white p-8 text-center">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            sent ? "bg-success-2 text-success-1" : "bg-warning-2 text-warning-1"
          }`}
        >
          {sent ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <Clock className="h-6 w-6" />
          )}
        </span>

        <p className="mt-4 text-lg font-extrabold text-grey-1">
          {sent ? "Transfer sent" : "Sent for approval"}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-grey-3">
          {sent
            ? `${formatToNaira(amount)} is on its way to ${details.accountName}.`
            : `${formatToNaira(amount)} to ${details.accountName} is waiting on an approver. Nothing has left the account yet.`}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={onDone}>
            Done
          </Button>
          <Button asChild className="flex-1">
            <Link href={sent ? "/expenses" : "/expenses/approvals"}>
              {sent ? "Back to expenses" : "View approvals"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <button
        onClick={onCancel}
        className="mb-4 flex items-center gap-1.5 rounded-lg border border-grey-5 px-3 py-2 text-sm font-bold text-grey-2 transition-colors hover:border-grey-4 hover:bg-grey-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="rounded-2xl border border-grey-5 bg-white p-6">
        <p className="text-lg font-extrabold text-grey-1">Confirm payout</p>
        <p className="mt-1 text-sm text-grey-3">
          Check the beneficiary before this goes any further.
        </p>

        <div className="mt-4 divide-y divide-grey-6">
          <Line label="To" value={details.accountName} strong />
          <Line
            label="Account"
            value={`${details.bankName} · ${details.accountNumber}`}
          />
          <Line label="Amount" value={formatToNaira(amount)} />
          <Line label="Bank charge" value={formatToNaira(charges)} />
          <Line
            label="Total from account"
            value={formatToNaira(amount + charges)}
            strong
          />
          {details.categoryName && (
            <Line label="Category" value={details.categoryName} />
          )}
          {details.narration && (
            <Line label="Narration" value={details.narration} />
          )}
        </div>

        {/* The charge is the backend's to calculate; this is a preview off the
            same bands, so it is labelled as one rather than stated as fact. */}
        <p className="mt-3 text-[11px] text-grey-4">
          The bank charge is an estimate and is confirmed when the payout runs.
        </p>

        {/* Says which of the three routes this amount takes, and why, before
            the PIN is asked for rather than after the outcome screen. */}
        {expectApproval && !blocked && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning-1/30 bg-warning-2 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning-1" />
            <p className="text-xs text-grey-2">
              {needsOwner
                ? `This is above your ${approvalCap !== null ? `${formatToNaira(approvalCap)} approval limit` : "approval limit"}, so only the business owner can release it.`
                : alwaysNeedsApproval && route === "EXECUTES"
                  ? "This business requires approval for staff payouts, so this one will wait for an approver."
                  : !canApprove
                    ? "Your payouts go to an approver before any money moves."
                    : transferCap !== null
                      ? `This is above the ${formatToNaira(transferCap)} you can pay out on your own, so another approver has to sign it off.`
                      : "This one will wait for an approver."}
            </p>
          </div>
        )}

        {/* Their own initiation cap, which only bites for someone who cannot
            approve. Worded as "ask the owner" rather than the business-ceiling
            note below, because this limit is on their staff permissions and
            Settings › Expense Controls is not theirs to open. */}
        {overPersonalCap && !overCap && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-error-1/30 bg-error-2 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-error-1" />
            <p className="text-xs text-grey-2">
              You can request up to{" "}
              {transferCap !== null ? formatToNaira(transferCap) : "your limit"}{" "}
              at a time, so this one will be refused. Ask the business owner to
              raise your limit, or split the payout.
            </p>
          </div>
        )}

        {/* The business ceiling binds everyone, owner included, and the answer
            is refusal rather than a queue — no one can approve past it, so
            offering "submit for approval" here would send it nowhere. */}
        {overCap && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-error-1/30 bg-error-2 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-error-1" />
            <p className="text-xs text-grey-2">
              This is above the {formatToNaira(perTransactionCap)} single-payout
              limit and will be refused. Raise the limit in Settings › Expense
              Controls, or split the payout.
            </p>
          </div>
        )}

        {/* One button, and it always goes through the PIN dialog.
            "Submit for approval" used to post straight through with no PIN,
            which the backend now refuses outright — a PIN is mandatory on
            every payout whether it executes or queues. The label carries the
            difference instead. */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            className="h-11 rounded-xl"
            disabled={isPending || blocked}
            onClick={() => setAskingPin(true)}
          >
            {isPending ? (
              <Spinner className="mr-2" size="sm" />
            ) : expectApproval ? (
              "Submit for approval"
            ) : (
              "Send now"
            )}
          </Button>
        </div>
      </div>

      <TransactionPinDialog
        open={askingPin}
        onClose={() => setAskingPin(false)}
        loading={isPending}
        title={expectApproval ? "Confirm this request" : "Authorise this payout"}
        description={
          expectApproval
            ? `${formatToNaira(amount)} to ${details.accountName} goes to an approver. Nothing leaves the account yet.`
            : `${formatToNaira(amount + charges)} will leave the expense account.`
        }
        actionLabel={expectApproval ? "Submit for approval" : "Send now"}
        onSubmit={(pin) => submit(pin)}
      />
    </div>
  );
};

export default ConfirmExpenseTransfer;
