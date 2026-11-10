"use client";

import {
  useChangeOverridePinMutation,
  useOverridePinStatusQuery,
  useSetOverridePinMutation,
} from "@/api/user/override-pin";
import CreatePinFields, { PinOtpField } from "@/components/app/CreatePinFields";
import { isValidNewPin, PIN_CREATE_LENGTH } from "@/components/app/pin-rules";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { KeyRound } from "lucide-react";
import { useState } from "react";

/**
 * The manager override PIN, typed at the till to approve a cashier's discount
 * or sale reversal. Separate from the transaction PIN: it's entered in front
 * of staff, so it should be different and changed on its own.
 */
const OverridePinSettings = () => {
  const { data, isLoading } = useOverridePinStatusQuery();
  const hasPin = Boolean(data?.hasPin);

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

  const { mutate: createPin, isPending: creating } =
    useSetOverridePinMutation(clear);
  const { mutate: changePin, isPending: changing } =
    useChangeOverridePinMutation(clear);
  const busy = creating || changing;

  const handleSubmit = () => {
    setError("");
    if (!isValidNewPin(pin)) {
      setError(`Choose a ${PIN_CREATE_LENGTH}-digit PIN.`);
      return;
    }
    if (pin !== confirmPin) {
      setError("The two PINs do not match.");
      return;
    }
    if (hasPin) {
      if (!isValidNewPin(oldPin)) {
        setError(`Enter your current ${PIN_CREATE_LENGTH}-digit override PIN.`);
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
            <KeyRound className="h-5 w-5" />
          </span>
          <p className="mt-4 text-lg font-extrabold text-grey-1">
            {hasPin ? "Change your override PIN" : "Create a manager override PIN"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-grey-3">
            Type it at the till to approve a cashier&apos;s manual discount or
            sale reversal. Each approval is recorded with your name.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-grey-5 bg-white p-6">
          <p className="mb-5 rounded-xl bg-primary-green-500 p-3 text-xs text-grey-3">
            Use a different PIN from your transaction PIN: this one is typed in
            front of staff. Change it if you think someone has seen it.
          </p>

          <div className="space-y-5">
            {hasPin && (
              <PinOtpField
                label={`Current ${PIN_CREATE_LENGTH}-digit override PIN`}
                value={oldPin}
                onChange={setOldPin}
                disabled={busy}
              />
            )}
            <CreatePinFields
              pin={pin}
              confirmPin={confirmPin}
              onPinChange={setPin}
              onConfirmChange={setConfirmPin}
              disabled={busy}
              pinLabel={
                hasPin
                  ? `New ${PIN_CREATE_LENGTH}-digit PIN`
                  : `Choose a ${PIN_CREATE_LENGTH}-digit PIN`
              }
              confirmLabel={`Confirm ${PIN_CREATE_LENGTH}-digit PIN`}
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

export default OverridePinSettings;
