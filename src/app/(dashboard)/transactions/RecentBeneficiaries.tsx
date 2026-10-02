"use client";

import {
  useFetchRecentBeneficiariesQuery,
  type RecentBeneficiary,
} from "@/api/transactions/recent-beneficiaries";
import CustomSelect, {
  type SelectOption,
  type SelectValue,
} from "@/components/app/CustomSelect";
import { useMemo, useState } from "react";

/**
 * The people this wallet has paid before, as a searchable picker.
 *
 * Nobody enjoys retyping a ten-digit account number for the supplier they pay
 * every Friday, and a mistyped one is money gone. Picking a recipient fills
 * the bank and the number below; the enquiry then runs as it always does and
 * re-confirms the name with the bank before anything can be sent.
 *
 * The same select as the bank picker on purpose — one search box behaves one
 * way, and a merchant with thirty saved recipients can type rather than scroll.
 *
 * Renders nothing when the wallet has never paid anyone, so a new business
 * sees the form exactly as before rather than an empty control.
 */

/** Enough rows that local search has something to work with. Upstream caps at 50. */
const FETCH_LIMIT = 50;

const maskAccount = (accountNumber?: string) =>
  accountNumber ? `•••• ${accountNumber.slice(-4)}` : "••••";

const keyOf = (beneficiary: RecentBeneficiary) =>
  `${beneficiary.bank_code ?? beneficiary.bank_name}-${beneficiary.account_number}`;

const RecentBeneficiaries = ({
  walletId,
  onSelect,
  selectedAccountNumber,
  className,
}: {
  walletId?: string | null;
  onSelect: (beneficiary: RecentBeneficiary) => void;
  /** Keeps the picker showing whoever the form is currently filled from. */
  selectedAccountNumber?: string;
  className?: string;
}) => {
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useFetchRecentBeneficiariesQuery({
    params: { walletId: walletId ?? "", limit: FETCH_LIMIT },
  });

  const beneficiaries = useMemo(() => data ?? [], [data]);

  /**
   * The label carries the name, bank and account number because react-select
   * searches it — typing "access", "0123" or half a name all have to find the
   * row. What is actually drawn comes from `formatOptionLabel` below.
   */
  const options: SelectOption[] = useMemo(
    () =>
      beneficiaries.map((beneficiary) => ({
        value: keyOf(beneficiary),
        label: `${beneficiary.account_name} · ${beneficiary.bank_name} · ${beneficiary.account_number}`,
        beneficiary,
      })),
    [beneficiaries],
  );

  const value: SelectValue =
    options.find(
      (option) =>
        selectedAccountNumber &&
        option.beneficiary.account_number === selectedAccountNumber,
    ) ?? null;

  // No spinner and no empty state: this sits above a form that works perfectly
  // well without it, and a placeholder control here would only push the fields
  // around while it loads.
  if (isLoading || beneficiaries.length === 0) return null;

  return (
    <div className={className}>
      <CustomSelect
        label="Recent recipient"
        placeholder="Search someone you've paid before..."
        options={options}
        value={value}
        onChange={(option) => {
          if (option?.beneficiary) onSelect(option.beneficiary);
        }}
        isClearable
        formatOptionLabel={(option: any) => {
          const beneficiary: RecentBeneficiary = option.beneficiary;
          if (!beneficiary) return option.label;

          const key = keyOf(beneficiary);
          const showLogo = beneficiary.bank_logo && !failedLogos[key];

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              {showLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={beneficiary.bank_logo as string}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full object-contain"
                  // Not every institution in the bank registry has a logo, and
                  // the API says so with "" or null. A broken image in a row
                  // someone is about to send money from is worse than initials.
                  onError={() =>
                    setFailedLogos((current) => ({ ...current, [key]: true }))
                  }
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-[10px] font-bold text-white">
                  {beneficiary.initials || "?"}
                </span>
              )}

              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  {beneficiary.account_name}
                </span>
                <span className="block truncate text-xs opacity-70">
                  {beneficiary.bank_name} · {maskAccount(beneficiary.account_number)}
                </span>
              </span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default RecentBeneficiaries;
