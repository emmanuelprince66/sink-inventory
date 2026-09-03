"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

/** The backend accepts 4 to 10 digits. */
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 10;

export const isValidPin = (pin: string) =>
  pin.length >= PIN_MIN_LENGTH && pin.length <= PIN_MAX_LENGTH;

/**
 * A transaction PIN entry field.
 *
 * Deliberately one masked box rather than the fixed grid `OtpInput` draws: a
 * transaction PIN is 4 to 10 digits and the person typing does not know in
 * advance how many boxes theirs needs, so a grid either shows the wrong count
 * or has to redraw as they type.
 *
 * Masked by default with a reveal toggle — these are entered at a counter with
 * a customer standing across it, and a mistyped PIN that cannot be checked is
 * the reason people give up and set an easy one.
 */
const PinField = ({
  value,
  onChange,
  label,
  placeholder = "Enter PIN",
  autoFocus,
  disabled,
  onEnter,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  /** Fired on Enter, so a PIN can be submitted without reaching for the mouse. */
  onEnter?: () => void;
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          {label}
        </label>
      )}
      <div className={cn("relative", label && "mt-2")}>
        <Input
          value={value}
          type={revealed ? "text" : "password"}
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          maxLength={PIN_MAX_LENGTH}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(
              e.target.value.replace(/\D/g, "").slice(0, PIN_MAX_LENGTH),
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          className="h-11 rounded-xl pr-11 tracking-[0.4em]"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setRevealed((shown) => !shown)}
          aria-label={revealed ? "Hide PIN" : "Show PIN"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-4 hover:text-grey-2"
        >
          {revealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PinField;
