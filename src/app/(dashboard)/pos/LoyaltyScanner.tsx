"use client";

import { fetchCustomers } from "@/api/customer/useGetCustomerQuery";
import { Spinner } from "@/components/app/Spinner";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useState } from "react";
import { BarCodeScanner } from "./BarCodeScanner";

/**
 * Scans a customer's loyalty card and resolves the code to a customer.
 *
 * The QR encodes the loyalty code (e.g. LOY-ABFI3K). There is no endpoint that
 * looks a customer up by loyalty code directly, so this searches the customer
 * list with the scanned value and matches on loyalty_code, which every row
 * carries. That works only if the backend's `search` covers loyalty_code —
 * it is documented as name/email/phone — so the no-match message says exactly
 * what was scanned, rather than implying the customer does not exist.
 */
const LoyaltyScanner = ({
  open,
  onOpenChange,
  onResolved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: (loyaltyCode: string, matched?: any) => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();
  const [looking, setLooking] = useState(false);

  const handleScan = async (raw: string) => {
    const code = (raw || "").trim();
    onOpenChange(false);
    if (!code || !business_id) return;

    setLooking(true);
    try {
      const response = await fetchCustomers({
        id: business_id,
        search: code,
        page: 1,
        limit: 30,
      } as any);

      const rows = response?.data?.results?.data ?? [];

      // Prefer an exact loyalty_code match; fall back to a single hit, since a
      // search on a unique code that returns one row is unambiguous.
      const match =
        rows.find(
          (row: any) =>
            (row.loyalty_code || "").toUpperCase() === code.toUpperCase(),
        ) ?? (rows.length === 1 ? rows[0] : null);

      // Show the wallet either way — it is keyed by the code itself. Without a
      // customer match the modal simply omits "Add to Sale".
      onResolved(code, match ?? undefined);
      if (!match) {
        showToast(
          `Loyalty found, but no customer record matched ${code}`,
          "error",
        );
      }
    } catch {
      // The lookup is only for Add to Sale — still open the wallet.
      onResolved(code);
    } finally {
      setLooking(false);
    }
  };

  return (
    <>
      {open && (
        <BarCodeScanner
          onScanResult={handleScan}
          onClose={() => onOpenChange(false)}
        />
      )}

      {looking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4">
            <Spinner className="text-primary-green-300" />
            <p className="text-sm font-bold text-grey-1">Finding customer…</p>
          </div>
        </div>
      )}
    </>
  );
};

export default LoyaltyScanner;
