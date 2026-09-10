"use client";

import { OtpInput } from "@/components/app/OtpInput";
import { PIN_CREATE_LENGTH } from "@/components/app/pin-rules";

/**
 * One labelled four-box PIN grid.
 *
 * The same `OtpInput` the wallet PIN uses, at the same length, because the two
 * PINs sit one tab apart in Settings and a person who has set one should not
 * meet a different control for the other. It also replaces a single masked box
 * that had to advertise "4 to 10 digits" — a decision nobody wants to make
 * about a PIN they will type at a counter — where four boxes simply show how
 * many digits are wanted.
 */
export const PinOtpField = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  // Dimmed rather than unmounted while a request is in flight: OtpInput has no
  // disabled prop of its own, and removing the grid mid-submit would throw
  // away what they typed if the call fails.
  <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
    {/* Label and grid styled to match the wallet PIN's own entry step
        (transactions/ConfirmTransfer) — left-aligned label above a centred
        grid — so the two PINs look like the same control wherever they are
        asked for. */}
    <label className="mb-2 block text-sm font-medium text-grey-2">
      {label}
    </label>
    <div className="flex justify-center">
      <OtpInput value={value} onChange={onChange} length={PIN_CREATE_LENGTH} />
    </div>
  </div>
);

/** Choosing a new PIN: the grid twice, entry and confirmation. */
const CreatePinFields = ({
  pin,
  confirmPin,
  onPinChange,
  onConfirmChange,
  disabled,
  pinLabel = "New 4-digit PIN",
  confirmLabel = "Confirm PIN",
}: {
  pin: string;
  confirmPin: string;
  onPinChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  disabled?: boolean;
  pinLabel?: string;
  confirmLabel?: string;
}) => (
  <div className="space-y-5">
    <PinOtpField
      label={pinLabel}
      value={pin}
      onChange={onPinChange}
      disabled={disabled}
    />
    <PinOtpField
      label={confirmLabel}
      value={confirmPin}
      onChange={onConfirmChange}
      disabled={disabled}
    />
  </div>
);

export default CreatePinFields;
