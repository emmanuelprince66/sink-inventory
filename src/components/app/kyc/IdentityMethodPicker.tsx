"use client";

import { IDENTITY_LABELS, type IdentityMethod } from "@/hooks/useKycHook";
import { cn } from "@/lib/utils";
import { CreditCard, IdCard } from "lucide-react";

const OPTIONS: {
  value: IdentityMethod;
  hint: string;
  icon: typeof IdCard;
}[] = [
  {
    value: "nin",
    hint: "The 11-digit number on your NIMC slip. Dial *346# to retrieve it.",
    icon: IdCard,
  },
  {
    value: "bvn",
    hint: "The 11-digit number your bank holds. Dial *565*0# to retrieve it.",
    icon: CreditCard,
  },
];

/**
 * Which identifier Tier 1 is opened with.
 *
 * Radio cards rather than a dropdown: there are exactly two choices, both need
 * a line of explanation for a merchant who doesn't know which they have to
 * hand, and the pair costs no more room than the select would.
 */
const IdentityMethodPicker = ({
  value,
  onChange,
}: {
  value: IdentityMethod;
  onChange: (method: IdentityMethod) => void;
}) => (
  <div role="radiogroup" aria-label="Identity type" className="grid gap-3 sm:grid-cols-2">
    {OPTIONS.map((option) => {
      const active = value === option.value;
      const Icon = option.icon;

      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
            active
              ? "border-primary-green-300 bg-secondary-6/50 ring-1 ring-primary-green-300"
              : "border-grey-5 bg-white hover:border-secondary-3",
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              active
                ? "bg-primary-green-300 text-white"
                : "bg-grey-6 text-grey-3",
            )}
          >
            <Icon size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-grey-1">
              {IDENTITY_LABELS[option.value]}
            </span>
            <span className="mt-0.5 block text-xs text-grey-3">
              {option.hint}
            </span>
          </span>
          <span
            className={cn(
              "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
              active ? "border-primary-green-300" : "border-grey-5",
            )}
          >
            {active && (
              <span className="size-2 rounded-full bg-primary-green-300" />
            )}
          </span>
        </button>
      );
    })}
  </div>
);

export default IdentityMethodPicker;
