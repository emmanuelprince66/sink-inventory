"use client";

import { useFetchExpenseSettingsQuery } from "@/api/expenses/expense-settings";
import { useInitiateExpenseTransferMutation } from "@/api/expenses/expense-transfers";
import TransactionPinDialog from "@/components/app/TransactionPinDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import {
  estimateCharges,
  type ExpenseSettings,
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
  const { user } = useUserRole();
  const [askingPin, setAskingPin] = useState(false);
  const [outcome, setOutcome] = useState<"SENT" | "QUEUED" | null>(null);

  const { data: settingsData } = useFetchExpenseSettingsQuery({
    params: { id: business_id },
  });
  const settings: ExpenseSettings | undefined = settingsData?.data;

  const amount = Number(details.amount) || 0;
  const charges = estimateCharges(amount);

  // Whether this one can go out instantly, worked out before submitting so the
  // buttons can say what they will actually do. The backend decides for real —
  // it also knows the caller's permissions and the day's running total — so
  // this is about setting expectations, never about gating the request.
  const perTransactionCap = Number(settings?.max_amount_per_transaction ?? 0);
  const overCap = perTransactionCap > 0 && amount > perTransactionCap;
  const alwaysNeedsApproval = Boolean(settings?.require_approval_for_all);

  /**
   * The owner is the top authority: their PIN releases a payout there and
   * then, and the "approval required" switch governs staff, not them. It is
   * still the limits that bind — an amount over the cap is refused for
   * everyone, which is a different answer from "this needs a signature".
   */
  const isOwner = user?.role === "OWNER";
  const expectApproval = !isOwner && (alwaysNeedsApproval || overCap);

  const { mutate: initiate, isPending } = useInitiateExpenseTransferMutation({
    onSuccess: (response: any) => {
      const status = response?.data?.data?.status ?? response?.data?.status;
      setAskingPin(false);
      setOutcome(status === "SUCCESS" ? "SENT" : "QUEUED");
    },
  });

  const submit = (pin?: string) => {
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
        ...(details.categoryId ? { category_id: details.categoryId } : {}),
        ...(details.narration ? { narration: details.narration } : {}),
        ...(pin ? { pin } : {}),
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

        {expectApproval && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning-1/30 bg-warning-2 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning-1" />
            <p className="text-xs text-grey-2">
              {alwaysNeedsApproval
                ? "This business requires approval for staff payouts, so this one will wait for an approver."
                : `This is above the ${formatToNaira(perTransactionCap)} single-payout limit, so it will need approval.`}
            </p>
          </div>
        )}

        {/* The limits bind the owner too, but the answer is refusal rather
            than a queue — no one can approve past the ceiling, so offering
            "submit for approval" here would be sending it nowhere. */}
        {isOwner && overCap && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-error-1/30 bg-error-2 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-error-1" />
            <p className="text-xs text-grey-2">
              This is above the {formatToNaira(perTransactionCap)} single-payout
              limit and will be refused. Raise the limit in Settings › Expense
              Controls, or split the payout.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {!expectApproval && (
            <Button
              className="h-11 rounded-xl"
              disabled={isPending}
              onClick={() => setAskingPin(true)}
            >
              {isPending ? (
                <Spinner className="mr-2" size="sm" />
              ) : (
                "Send now"
              )}
            </Button>
          )}

          {/* Not offered to the owner: there is nobody above them to approve
              it, so the button would queue a payout that only they could
              release — an extra step to arrive back where they started. */}
          {!isOwner && (
            <Button
              variant={expectApproval ? "default" : "outline"}
              className="h-11 rounded-xl"
              disabled={isPending}
              onClick={() => submit()}
            >
              {isPending && expectApproval ? (
                <Spinner className="mr-2" size="sm" />
              ) : (
                "Submit for approval"
              )}
            </Button>
          )}
        </div>
      </div>

      <TransactionPinDialog
        open={askingPin}
        onClose={() => setAskingPin(false)}
        loading={isPending}
        title="Authorise this payout"
        description={`${formatToNaira(amount + charges)} will leave the expense account.`}
        actionLabel="Send now"
        onSubmit={(pin) => submit(pin)}
      />
    </div>
  );
};

export default ConfirmExpenseTransfer;
