"use client";

import {
  hasPinFrom,
  pinRequiredFrom,
  useChangeUserPinMutation,
  useSetUserPinMutation,
  useUserPinStatusQuery,
} from "@/api/user/pin";
import PinField, { isValidPin, PIN_MIN_LENGTH } from "@/components/app/PinField";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

/**
 * The personal transaction PIN that authorises expense payouts and approvals.
 *
 * Separate from the wallet PIN in the tab beside this one. That one belongs to
 * the business and secures wallet transfers; this one belongs to the person
 * and travels with them across the businesses they work in. Both exist, which
 * is why each panel says which is which rather than both calling themselves
 * "your PIN".
 */
const TransactionPinSettings = () => {
  const { data, isLoading } = useUserPinStatusQuery();
  const hasPin = hasPinFrom(data);
  /**
   * Someone with no payout rights needs no PIN.
   *
   * The panel still lets them set one — they may be granted the rights
   * tomorrow, and a hidden setting is harder to find than an unnecessary one —
   * but it stops telling them they are missing something they are not.
   */
  const pinRequired = pinRequiredFrom(data);

  const [oldPin, setOldPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const clear = () => {
    setOldPin("");
    setPin("");
    setConfirmPin("");
    setError("");
  };

  const { mutate: createPin, isPending: creating } = useSetUserPinMutation({
    onSuccess: clear,
  });
  const { mutate: changePin, isPending: changing } = useChangeUserPinMutation({
    onSuccess: clear,
  });

  const busy = creating || changing;

  const handleSubmit = () => {
    setError("");

    if (!isValidPin(pin)) {
      setError(`Choose a PIN of at least ${PIN_MIN_LENGTH} digits.`);
      return;
    }
    if (pin !== confirmPin) {
      setError("The two PINs do not match.");
      return;
    }

    if (hasPin) {
      if (!isValidPin(oldPin)) {
        setError("Enter your current PIN.");
        return;
      }
      changePin({ old_pin: oldPin, new_pin: pin });
      return;
    }

    createPin({ pin });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center py-2">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-6 text-primary-green-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <p className="mt-4 text-lg font-extrabold text-grey-1">
            {hasPin ? "Change your transaction PIN" : "Create a transaction PIN"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-grey-3">
            Used to authorise expense payouts and to approve other
            people&apos;s requests.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-grey-5 bg-white p-6">
          <p className="mb-5 rounded-xl bg-primary-green-500 p-3 text-xs text-grey-3">
            This is your own PIN, not the business&apos;s — separate from the
            wallet PIN, and it follows you across businesses. Between{" "}
            {PIN_MIN_LENGTH} and 10 digits.
          </p>

          {!pinRequired && !hasPin && (
            <p className="mb-5 rounded-xl bg-grey-6 p-3 text-xs text-grey-3">
              You don&apos;t need one right now — your account can&apos;t send
              or approve expense payouts. Setting one anyway does no harm if
              that changes later.
            </p>
          )}

          <div className="space-y-5">
            {hasPin && (
              <PinField
                label="Current PIN"
                value={oldPin}
                onChange={setOldPin}
                disabled={busy}
                placeholder="Enter current PIN"
              />
            )}

            <PinField
              label={hasPin ? "New PIN" : "PIN"}
              value={pin}
              onChange={setPin}
              disabled={busy}
              placeholder="4 to 10 digits"
            />

            <PinField
              label="Confirm PIN"
              value={confirmPin}
              onChange={setConfirmPin}
              disabled={busy}
              placeholder="Repeat it"
              onEnter={handleSubmit}
            />
          </div>

          {error && (
            <p className="mt-4 text-xs font-bold text-error-1">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={busy}
            className="mt-6 h-11 w-full rounded-xl"
          >
            {busy ? (
              <Spinner className="mr-2" size="sm" />
            ) : hasPin ? (
              "Change PIN"
            ) : (
              "Set PIN"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPinSettings;
