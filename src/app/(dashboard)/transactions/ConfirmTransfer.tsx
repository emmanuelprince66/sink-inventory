import { OtpInput } from "@/components/app/OtpInput";
import { Spinner } from "@/components/ui/spinner";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowBigLeftDash } from "lucide-react";
import { useState } from "react";

const calculateCharges = (amount: number) => {
  if (amount <= 5000) return 10;
  if (amount <= 50000) return 25;
  return 50;
};

const ConfirmTransfer = ({
  transferDetails,
  beneficiaryInfo,
  onCancel,
}: any) => {
  const { handleSubmitTransferFunds, TransferFundsLoading } =
    useTransactionsHook({ beneficiaryInfo });
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const charges = calculateCharges(transferDetails?.amount || 0);
  const totalAmount = (parseInt(transferDetails?.amount) || 0) + charges;

  const handleTransfer = async () => {
    if (pin.length !== 4) {
      setError("Please enter a valid 4-digit PIN");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await handleSubmitTransferFunds({
        ...transferDetails,
        pin: pin,
        beneficiaryRef: beneficiaryInfo?.data?.ref,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div onClick={onCancel}>
        <ArrowBigLeftDash className="text-primary-black-100 cursor-pointer w-6 h-6" />
      </div>
      <div className="md:w-[60%] w-full p-6 mx-auto border border-gray-200 rounded-lg shadow">
        <p className="text-2xl font-semibold text-gray-800 mb-2">
          Confirm Transfer
        </p>
        <p className="text-gray-600 mb-6">
          Please verify the transaction details and enter your PIN to complete
          the transfer.
        </p>

        {/* Transfer Details Card */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Bank Name:</span>
              <span className="text-gray-600">
                {transferDetails?.bank?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Account Number:</span>
              <span className="text-gray-600">
                {transferDetails?.accountNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Account Name:</span>
              <span className="text-gray-600">
                {transferDetails?.accountName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Amount:</span>
              <span className="text-green-600 font-medium">
                {formatToNaira(transferDetails?.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Charges:</span>
              <span className="text-gray-700 font-medium">
                {formatToNaira(charges)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 border-gray-200">
              <span className="font-bold text-gray-800">Total:</span>
              <span className="text-green-600 font-bold">
                {formatToNaira(totalAmount)}
              </span>
            </div>
            {transferDetails?.narration && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-700">Narration:</span>
                <span className="text-gray-600">
                  {transferDetails.narration}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PIN Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter 4-digit PIN
          </label>
          <div className="flex justify-center">
            <OtpInput value={pin} onChange={setPin} length={4} />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 space-y-3">
          <button
            onClick={handleTransfer}
            disabled={TransferFundsLoading || pin.length !== 4}
            className={`w-full py-3 cursor-pointer rounded-lg font-medium flex items-center justify-center ${
              TransferFundsLoading || pin.length !== 4
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {TransferFundsLoading ? (
              <>
                <Spinner className="mr-2" size="sm" />
                Processing...
              </>
            ) : (
              "Complete Transfer"
            )}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 cursor-pointer border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTransfer;
