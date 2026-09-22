"use client";

import { Spinner } from "@/components/app/Spinner";
import dynamic from "next/dynamic";

export interface TransferReceiptDetails {
  amount: number | string;
  senderName?: string;
  beneficiaryName?: string;
  beneficiaryAccount?: string;
  beneficiaryBank?: string;
  narration?: string;
  transactionId?: string;
  /** ISO string from the API, or nothing — then the transfer just happened. */
  date?: string;
  status?: string;
}

/**
 * Pulls the transaction's reference out of a transfer response.
 *
 * The wallet route wraps the provider's payload twice ({success, data:{...}})
 * and providers disagree on what the reference is called, so every shape we
 * have seen is tried before falling back to a dash — a receipt with one field
 * missing is still worth showing.
 */
export const extractTransactionId = (response: any): string => {
  const payload = response?.data?.data ?? response?.data ?? response;

  return (
    payload?.reference ??
    payload?.txnId ??
    payload?.transaction_id ??
    payload?.transactionId ??
    payload?.sessionId ??
    payload?.id ??
    "-"
  );
};

// The receipt itself (TransferReceiptView) builds its PDF with
// @react-pdf/renderer, which is browser-only and breaks under SSR — loaded on
// the client only, as the POS receipt is.
const TransferReceiptView = dynamic(() => import("./TransferReceiptView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-10">
      <Spinner />
    </div>
  ),
});

const TransferReceipt = (props: {
  details: TransferReceiptDetails;
  onBack: () => void;
}) => <TransferReceiptView {...props} />;

export default TransferReceipt;
