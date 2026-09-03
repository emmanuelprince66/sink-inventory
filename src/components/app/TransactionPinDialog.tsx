"use client";

import {
  hasPinFrom,
  useSetUserPinMutation,
  useUserPinStatusQuery,
} from "@/api/user/pin";
import { CustomModal } from "@/components/app/CustomModal";
import PinField, { isValidPin, PIN_MIN_LENGTH } from "@/components/app/PinField";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Asks for the transaction PIN that authorises a payout or an approval.
 *
 * Also handles the case that makes this more than an input box: someone who
 * has never set a PIN. Sending them off to Settings mid-approval loses the
 * transfer they were looking at, so the dialog switches to creating one and
 * carries straight on into the action once it is set.
 *
 * The PIN is passed to `onSubmit` and never stored — not in state that
 * outlives the dialog, not in a query cache. Closing forgets it.
 */
const TransactionPinDialog = ({
  open,
  onClose,
  onSubmit,
  title = "Enter your transaction PIN",
  description,
  actionLabel = "Confirm",
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  loading?: boolean;
}) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading: checkingPin } = useUserPinStatusQuery({
    enabled: open,
  });
  const hasPin = hasPinFrom(data);

  const { mutate: createPin, isPending: creatingPin } = useSetUserPinMutation({
    onSuccess: () => {
      // Straight through to the action rather than making them re-enter it —
      // they typed this PIN twice already.
      onSubmit(pin);
    },
  });

  // Never leave a PIN sitting in state behind a closed dialog.
  useEffect(() => {
    if (!open) {
      setPin("");
      setConfirmPin("");
      setError("");
    }
  }, [open]);

  const busy = Boolean(loading) || creatingPin;

  const handleSubmit = () => {
    setError("");

    if (!isValidPin(pin)) {
      setError(`Your PIN is at least ${PIN_MIN_LENGTH} digits.`);
      return;
    }

    if (!hasPin) {
      if (pin !== confirmPin) {
        setError("The two PINs do not match.");
        return;
      }
      createPin({ pin });
      return;
    }

    onSubmit(pin);
  };

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      trigger={false}
      size="sm"
      title={hasPin ? title : "Create your transaction PIN"}
      description={
        hasPin
          ? description
          : "You need a transaction PIN before money can leave the account. Choose one now and we'll carry on."
      }
    >
      <div className="w-full space-y-4">
        {checkingPin ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 rounded-xl bg-primary-green-500 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-green-300" />
              <p className="text-xs text-grey-3">
                This PIN is yours, not the business&apos;s. It authorises
                payouts and approvals wherever you work.
              </p>
            </div>

            <PinField
              value={pin}
              onChange={setPin}
              autoFocus
              disabled={busy}
              label={hasPin ? "Transaction PIN" : "New PIN"}
              placeholder={hasPin ? "Enter PIN" : "4 to 10 digits"}
              onEnter={hasPin ? handleSubmit : undefined}
            />

            {!hasPin && (
              <PinField
                value={confirmPin}
                onChange={setConfirmPin}
                disabled={busy}
                label="Confirm PIN"
                placeholder="Repeat it"
                onEnter={handleSubmit}
              />
            )}

            {error && <p className="text-xs font-bold text-error-1">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={busy || !pin}
              >
                {busy ? (
                  <Spinner className="mr-2" size="sm" />
                ) : hasPin ? (
                  actionLabel
                ) : (
                  "Set PIN & continue"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
};

export default TransactionPinDialog;
