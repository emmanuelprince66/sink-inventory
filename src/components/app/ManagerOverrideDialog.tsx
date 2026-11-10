"use client";

import { PinOtpField } from "@/components/app/CreatePinFields";
import { CustomModal } from "@/components/app/CustomModal";
import { PIN_CREATE_LENGTH } from "@/components/app/pin-rules";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * "Manager approval required": a manager types their override PIN to approve
 * this one action. The PIN goes straight into the retried request and isn't
 * kept anywhere; closing forgets it.
 */
const ManagerOverrideDialog = ({
  open,
  onClose,
  onSubmit,
  actionText,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  /** What's being approved, e.g. "reverse this sale". */
  actionText: string;
  loading?: boolean;
  /** Shown under the PIN, e.g. after a wrong PIN. */
  error?: string;
}) => {
  const [pin, setPin] = useState("");

  // A fresh PIN each time, and after a wrong one.
  useEffect(() => {
    if (!open || error) setPin("");
  }, [open, error]);

  return (
    <CustomModal
      isOpen={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      trigger={false}
      size="sm"
      title="Manager approval required"
      description={`You don't have permission to ${actionText}. A manager can approve it with their override PIN.`}
    >
      <div className="w-full space-y-4">
        <div className="flex items-start gap-2 rounded-xl bg-primary-green-500 p-3">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary-green-300" />
          <p className="text-xs text-grey-3">
            This approves only this one action, and it&apos;s recorded with the
            manager&apos;s name.
          </p>
        </div>

        <PinOtpField
          label={`Manager's ${PIN_CREATE_LENGTH}-digit override PIN`}
          value={pin}
          onChange={setPin}
          disabled={loading}
        />

        {error && <p className="text-xs font-bold text-error-1">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={loading || pin.length !== PIN_CREATE_LENGTH}
            onClick={() => onSubmit(pin)}
          >
            {loading ? <Spinner className="mr-2" size="sm" /> : "Approve"}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ManagerOverrideDialog;

export const OVERRIDE_PIN_WRONG =
  "That PIN didn't work. It may be wrong, belong to someone who can't approve this, or there have been too many tries. Wait a few minutes if so.";
