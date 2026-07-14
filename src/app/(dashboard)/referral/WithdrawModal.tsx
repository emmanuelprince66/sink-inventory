"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/toast/useToast";
import { formatToNaira } from "@/utils/formatMoney";
import { Banknote } from "lucide-react";
import { useState } from "react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

const WithdrawModal = ({
  isOpen,
  onClose,
  availableBalance,
}: WithdrawModalProps) => {
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setAmount("");
    setBankAccount("");
    setSubmitting(false);
  };

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      showToast("Enter a valid withdrawal amount.", "error");
      return;
    }
    if (value > availableBalance) {
      showToast("Amount exceeds your available balance.", "error");
      return;
    }
    if (!bankAccount.trim()) {
      showToast("Select a bank account.", "error");
      return;
    }

    // UI-only — simulate the round trip until the backend ships.
    setSubmitting(true);
    setTimeout(() => {
      showToast(
        `Withdrawal of ${formatToNaira(value)} requested.`,
        "success",
      );
      reset();
      onClose();
    }, 700);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Withdraw Referral Earnings"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 bg-success-2 rounded-lg p-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Banknote className="w-5 h-5 text-success-1" />
          </div>
          <div>
            <p className="text-xs font-bold text-success-1 uppercase tracking-wide">
              Available
            </p>
            <p className="text-lg font-extrabold text-grey-1">
              {formatToNaira(availableBalance)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="withdraw-amount" className="font-bold">
            Amount
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-grey-3">
              ₦
            </span>
            <Input
              id="withdraw-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="pl-7"
              disabled={submitting}
            />
          </div>
          <p className="text-xs text-grey-3">
            Maximum {formatToNaira(availableBalance)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="withdraw-bank" className="font-bold">
            Destination Bank Account
          </Label>
          <Input
            id="withdraw-bank"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="e.g. GTBank — 0123456789"
            disabled={submitting}
          />
          <p className="text-xs text-grey-3">
            Funds settle within 1 business day.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Withdraw"}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default WithdrawModal;
