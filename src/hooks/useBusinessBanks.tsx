"use client";

import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useSelectedBankStore } from "@/lib/store/useSelectedBankStore";
import { useUserRole } from "@/lib/store/user-store";
import { useEffect, useMemo } from "react";

export interface BusinessBankAccount {
  id: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  /** True on sub-accounts; the primary account is the one where this is false. */
  is_sub?: boolean;
}

/**
 * The business's bank accounts, and which one the wallet screens are reading.
 *
 * Every wallet call is keyed on a bank id now, not the business id, so this is
 * the single place that answers "which wallet?". The primary is the account
 * with is_sub false — treated as `!== true` rather than `=== false`, because
 * older payloads omit the field entirely and an account without it is the
 * original one, not a sub-account.
 */
export const useBusinessBanks = () => {
  const { isOwner } = useUserRole();
  const businessData = useBusinessDataStore((state: any) => state.businessData);
  const selectedBankId = useSelectedBankStore((state) => state.selectedBankId);
  const setSelectedBankId = useSelectedBankStore(
    (state) => state.setSelectedBankId,
  );

  const banks: BusinessBankAccount[] = useMemo(
    () => (Array.isArray(businessData?.banks) ? businessData.banks : []),
    [businessData],
  );

  const primaryBank = useMemo(
    () => banks.find((bank) => bank.is_sub !== true) ?? banks[0] ?? null,
    [banks],
  );

  // Only the owner picks an account. Everyone else reads the primary one,
  // resolved here rather than only hiding the switcher: the stored id decides
  // which wallet every call reads, so a non-owner left holding a sub-account
  // id would sit on it with no control to get back.
  const selectedBank = useMemo(() => {
    if (!isOwner) return primaryBank;
    return banks.find((bank) => bank.id === selectedBankId) ?? primaryBank;
  }, [banks, selectedBankId, primaryBank, isOwner]);

  // Settle the stored id onto a bank that actually exists. Covers the first
  // visit, and the case where a persisted id belongs to a bank that has since
  // been removed or to a business the user has switched away from — without
  // this the wallet would be queried with an id the business does not own.
  useEffect(() => {
    if (!isOwner || !banks.length) return;
    const stillValid = banks.some((bank) => bank.id === selectedBankId);
    if (!stillValid && primaryBank?.id) setSelectedBankId(primaryBank.id);
  }, [banks, selectedBankId, primaryBank, setSelectedBankId, isOwner]);

  return {
    banks,
    primaryBank,
    selectedBank,
    /** What every wallet request should be keyed on. */
    selectedBankId: selectedBank?.id ?? null,
    setSelectedBankId,
    hasBanks: banks.length > 0,
    hasMultipleBanks: banks.length > 1,
    /** Whether to offer the account switcher at all — owner-only. */
    canSwitchBanks: isOwner && banks.length > 1,
    isPrimary: (bank: BusinessBankAccount) => bank.id === primaryBank?.id,
  };
};
