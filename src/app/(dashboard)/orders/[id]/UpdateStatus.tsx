import { useEffect, useState } from "react";

const UpdateStatusComp = ({
  orderId,
  currentStatus,
  currentAmount,
  currentAmountPaid = 0,
  onClose,
  onSuccess,
}: any) => {
  // Mock hooks for demonstration
  const BankData = {
    data: [
      { id: "1", bank_name: "First Bank" },
      { id: "2", bank_name: "GTBank" },
      { id: "3", bank_name: "Access Bank" },
    ],
  };
  const BankDataLoading = false;
  const updateOrderPaymentStatusLoading = false;
  const showToast = (message: string, type: string) =>
    console.log(type, message);
  const updateOrderPaymentStatus = (data: any) => console.log("Update:", data);

  const totalAmount = parseFloat(currentAmount) || 0;
  const amountPaid = parseFloat(currentAmountPaid) || 0;
  const remainingAmount = totalAmount - amountPaid;
  const isFullyPaid = remainingAmount <= 0;

  const [status, setStatus] = useState(currentStatus || "UNPAID");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset fields when status changes
  useEffect(() => {
    if (status === "UNPAID") {
      setPaymentMethod("");
      setSelectedBank("");
      setAmount("");
    } else if (status === "PAID") {
      // Auto-fill with remaining amount for PAID status
      setAmount(remainingAmount.toFixed(2));
    } else if (status === "PARTIAL") {
      setAmount("");
    }
  }, [status, remainingAmount]);

  const paymentStatusOptions = [
    {
      label: "Unpaid",
      value: "UNPAID",
      disabled: amountPaid > 0, // Disable if any payment has been made
      tooltip:
        amountPaid > 0
          ? "Cannot mark as unpaid - payment already received"
          : "",
    },
    {
      label: "Partial",
      value: "PARTIAL",
      disabled: isFullyPaid, // Disable if fully paid
      tooltip: isFullyPaid ? "Order is already fully paid" : "",
    },
    {
      label: "Paid",
      value: "PAID",
      disabled: false, // Always allow paid
      tooltip: "",
    },
  ];

  const paymentMethodOptions = [
    { label: "Cash", value: "CASH" },
    { label: "Bank Transfer", value: "BANK" },
  ];

  const validateForm = () => {
    if (!status) {
      showToast("Please select a payment status", "error");
      return false;
    }

    // Validation for PAID or PARTIAL
    if (status === "PAID" || status === "PARTIAL") {
      if (!paymentMethod) {
        showToast("Please select a payment method", "error");
        return false;
      }

      const enteredAmount = parseFloat(amount);
      if (!amount || enteredAmount <= 0) {
        showToast("Please enter a valid amount", "error");
        return false;
      }

      // Check if amount exceeds remaining
      if (enteredAmount > remainingAmount) {
        showToast(
          `Amount cannot exceed remaining balance of ₦${remainingAmount.toLocaleString()}`,
          "error"
        );
        return false;
      }

      // For PAID status, amount must equal remaining amount
      if (status === "PAID" && enteredAmount < remainingAmount) {
        showToast(
          `For PAID status, amount must be ₦${remainingAmount.toLocaleString()} (full remaining balance)`,
          "error"
        );
        return false;
      }

      // For PARTIAL status, amount must be less than remaining amount
      if (status === "PARTIAL" && enteredAmount >= remainingAmount) {
        showToast(
          "For PARTIAL payment, amount must be less than remaining balance",
          "error"
        );
        return false;
      }

      if (paymentMethod === "BANK" && !selectedBank) {
        showToast("Please select a bank", "error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload: any = { status };

      if (status === "PAID" || status === "PARTIAL") {
        payload.amount = amount;
        payload.method = paymentMethod;

        if (paymentMethod === "BANK" && selectedBank !== "") {
          payload.bank = selectedBank;
        }
      }

      updateOrderPaymentStatus({ orderId, payload });
      showToast("Payment status updated successfully", "success");
      onClose();
    } catch (error) {
      showToast("Failed to update payment status", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Payment Summary
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Total Amount:</span>
                <span className="font-semibold text-blue-900">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Amount Paid:</span>
                <span className="font-semibold text-green-600">
                  ₦{amountPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-blue-200">
                <span className="text-blue-700 font-medium">
                  Remaining Balance:
                </span>
                <span className="font-bold text-blue-900">
                  ₦{remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            >
              <option value="">Select Status</option>
              {paymentStatusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  title={option.tooltip}
                >
                  {option.label} {option.disabled ? "(Not Available)" : ""}
                </option>
              ))}
            </select>
            {status &&
              paymentStatusOptions.find((opt) => opt.value === status)
                ?.tooltip && (
                <p className="mt-1 text-xs text-amber-600">
                  {
                    paymentStatusOptions.find((opt) => opt.value === status)
                      ?.tooltip
                  }
                </p>
              )}
          </div>

          {/* Payment Method - Show for PAID or PARTIAL */}
          {(status === "PAID" || status === "PARTIAL") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={remainingAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    status === "PAID"
                      ? `Enter ₦${remainingAmount.toLocaleString()}`
                      : "Enter amount"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                  disabled={status === "PAID"} // Auto-filled for PAID
                />
                {status === "PARTIAL" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Enter partial amount (max: ₦
                    {remainingAmount.toLocaleString()})
                  </p>
                )}
                {status === "PAID" && (
                  <p className="mt-1 text-xs text-green-600">
                    Full remaining balance will be marked as paid
                  </p>
                )}
              </div>

              {/* Bank Selection - Show only if BANK is selected */}
              {paymentMethod === "BANK" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bank <span className="text-red-500">*</span>
                  </label>
                  {BankDataLoading ? (
                    <div className="text-sm text-gray-500">
                      Loading banks...
                    </div>
                  ) : (
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    >
                      <option value="">Select Bank</option>
                      {BankData?.data?.map((bank: any) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bank_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </>
          )}

          {/* Status Info */}
          <div
            className={`border rounded-lg p-3 ${
              status === "UNPAID"
                ? "bg-red-50 border-red-200"
                : status === "PARTIAL"
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <p
              className={`text-sm ${
                status === "UNPAID"
                  ? "text-red-800"
                  : status === "PARTIAL"
                  ? "text-amber-800"
                  : "text-green-800"
              }`}
            >
              {status === "UNPAID" &&
                "No payment has been received for this order."}
              {status === "PARTIAL" &&
                amount &&
                parseFloat(amount) > 0 &&
                `Recording a partial payment of ₦${parseFloat(
                  amount
                ).toLocaleString()}. New remaining balance: ₦${(
                  remainingAmount - parseFloat(amount)
                ).toLocaleString()}`}
              {status === "PARTIAL" &&
                (!amount || parseFloat(amount) <= 0) &&
                `Enter the amount being paid now. Current remaining balance: ₦${remainingAmount.toLocaleString()}`}
              {status === "PAID" &&
                "This will mark the order as fully paid and complete the payment history."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateOrderPaymentStatusLoading || isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {updateOrderPaymentStatusLoading
                ? "Updating..."
                : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusComp;
