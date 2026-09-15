import { OtpInput } from "@/components/app/OtpInput";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TransferReceipt, {
  extractTransactionId,
  type TransferReceiptDetails,
} from "./TransferReceipt";

const calculateCharges = (amount: number) => {
  if (amount <= 5000) return 10;
  if (amount <= 50000) return 25;
  return 50;
};

const calculateStampDuty = (amount: number) => {
  // Stamp duty only applies to withdrawals above 10,000
  return amount > 10000 ? 50 : 0;
};

const ConfirmTransfer = ({
  transferDetails,
  beneficiaryInfo,
  onCancel,
  /**
   * The account the money leaves, when it is not the one the wallet screens
   * are pointed at — the expenses page sends the expense account chosen there.
   *
   * It has to be passed through rather than read from a store: this screen
   * builds its own useTransactionsHook, and without it the confirm step would
   * quietly debit the main wallet after the previous screen had shown, and
   * checked the balance of, a different account.
   */
  sourceBankId,
}: any) => {
  const { handleSubmitTransferFunds, TransferFundsLoading, TrxData } =
    useTransactionsHook({ beneficiaryInfo, sourceBankId });
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<TransferReceiptDetails | null>(null);

  const charges = calculateCharges(transferDetails?.amount || 0);
  const stampDuty = calculateStampDuty(transferDetails?.amount || 0);
  const totalAmount =
    (parseInt(transferDetails?.amount) || 0) + charges + stampDuty;

  const handleTransfer = async () => {
    if (pin.length !== 4) {
      setError("Please enter a valid 4-digit PIN");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await handleSubmitTransferFunds(
        {
          ...transferDetails,
          pin: pin,
          beneficiaryRef: beneficiaryInfo?.data?.ref,
        },
        {
          // The receipt is built from what was just sent plus the reference
          // that comes back — the transfer response carries the provider's
          // reference, not a re-statement of the beneficiary.
          onSuccess: (response: any) =>
            setReceipt({
              amount: transferDetails?.amount,
              senderName:
                TrxData?.data?.results?.wallet_details?.account_name ?? "",
              beneficiaryName: transferDetails?.accountName,
              beneficiaryAccount: transferDetails?.accountNumber,
              beneficiaryBank: transferDetails?.bank?.name,
              narration: transferDetails?.narration,
              transactionId: extractTransactionId(response),
            }),
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Leaving the receipt goes back to where the transfer started from, not to
  // the form behind it — that flow is finished and its state is spent.
  if (receipt) {
    return <TransferReceipt details={receipt} onBack={() => router.back()} />;
  }

  return (
    <div className="w-full flex flex-col gap-6 items-center">
      <div className="w-full md:w-[60%]">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="w-full p-6 border border-grey-5 rounded-2xl bg-white">
          <p className="text-xl font-extrabold text-grey-1 mb-2">
            Confirm Transfer
          </p>
          <p className="text-sm text-grey-3 mb-6">
            Please verify the transaction details and enter your PIN to complete
            the transfer.
          </p>

          {/* Transfer Details Card */}
          <div className="bg-grey-6/60 rounded-xl p-4 mb-6 border border-grey-5">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-grey-2">Bank Name:</span>
                <span className="text-sm text-grey-3">
                  {transferDetails?.bank?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-grey-2">Account Number:</span>
                <span className="text-sm text-grey-3">
                  {transferDetails?.accountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-grey-2">Account Name:</span>
                <span className="text-sm text-grey-3">
                  {transferDetails?.accountName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-grey-2">Amount:</span>
                <span className="text-sm text-success-1 font-bold">
                  {formatToNaira(transferDetails?.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-grey-2">System Charges:</span>
                <span className="text-sm text-grey-2 font-medium">
                  {formatToNaira(charges)}
                </span>
              </div>
              {stampDuty > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-grey-2">Stamp Duty:</span>
                  <span className="text-sm text-grey-2 font-medium">
                    {formatToNaira(stampDuty)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-grey-5 pt-2">
                <span className="text-sm font-bold text-grey-1">Total:</span>
                <span className="text-sm text-success-1 font-bold">
                  {formatToNaira(totalAmount)}
                </span>
              </div>
              {transferDetails?.narration && (
                <div className="flex justify-between pt-2 border-t border-grey-5">
                  <span className="text-sm font-medium text-grey-2">Narration:</span>
                  <span className="text-sm text-grey-3">
                    {transferDetails.narration}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PIN Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-grey-2 mb-2">
              Enter 4-digit PIN
            </label>
            <div className="flex justify-center">
              <OtpInput value={pin} onChange={setPin} length={4} />
            </div>
            {error && <p className="mt-2 text-sm text-error-1">{error}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleTransfer}
              disabled={TransferFundsLoading || pin.length !== 4}
              className="w-full h-12"
            >
              {TransferFundsLoading ? (
                <>
                  <Spinner className="mr-2" size="sm" />
                  Processing...
                </>
              ) : (
                "Complete Transfer"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full h-12"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTransfer;
