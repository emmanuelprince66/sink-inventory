"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ImagePlus,
  Info,
  KeyRound,
  Lock,
  Paperclip,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EXPENSE_ACCOUNT, EXPENSE_CATEGORIES } from "./mock-data";

interface TransferMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional pre-selected category (e.g. from a category tile). */
  defaultCategory?: string;
}

type Step = "form" | "pin" | "success";

const TransferMoneyModal = ({
  isOpen,
  onClose,
  defaultCategory,
}: TransferMoneyModalProps) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(
    defaultCategory || EXPENSE_CATEGORIES[0],
  );
  const [customCategory, setCustomCategory] = useState("");
  const [narration, setNarration] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [pinError, setPinError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pinRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isOpen && defaultCategory) {
      setCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  const effectiveCategory =
    category === "__custom__" ? customCategory.trim() : category;
  const amountNum = parseFloat(amount) || 0;
  const overBalance = amountNum > EXPENSE_ACCOUNT.balance;
  const requiresApproval = amountNum > EXPENSE_ACCOUNT.approvalThreshold;

  const reset = () => {
    setStep("form");
    setAmount("");
    setCategory(defaultCategory || EXPENSE_CATEGORIES[0]);
    setCustomCategory("");
    setNarration("");
    setAttachments([]);
    setPin(["", "", "", ""]);
    setPinError(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAttach = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((f) => f.size <= 10 * 1024 * 1024);
    setAttachments((prev) => [...prev, ...next].slice(0, 5));
  };
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = () => {
    if (amountNum <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    if (overBalance) {
      showToast("Amount exceeds the expense account balance.", "error");
      return;
    }
    if (!effectiveCategory) {
      showToast("Pick or enter an expense category.", "error");
      return;
    }
    if (!narration.trim()) {
      showToast("Add a short narration so this expense is auditable.", "error");
      return;
    }
    setStep("pin");
    // Focus first PIN cell after the step swap renders.
    setTimeout(() => pinRefs.current[0]?.focus(), 50);
  };

  const setPinDigit = (index: number, value: string) => {
    // Allow only digits, single character per cell.
    const digit = value.replace(/\D/g, "").slice(0, 1);
    setPinError(false);
    setPin((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (text.length === 0) return;
    e.preventDefault();
    const filled = text.padEnd(4, "").split("").slice(0, 4);
    setPin([filled[0] || "", filled[1] || "", filled[2] || "", filled[3] || ""]);
    setPinError(false);
    pinRefs.current[Math.min(text.length, 3)]?.focus();
  };

  const handlePinConfirm = () => {
    const pinValue = pin.join("");
    // UI-only validation — accept any 4 digits. Swap for the real PIN check
    // when the backend exposes a /transaction-pin/verify endpoint.
    if (pinValue.length !== 4 || !/^\d{4}$/.test(pinValue)) {
      setPinError(true);
      showToast("Enter your 4-digit transaction PIN.", "error");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setStep("success");
      setSubmitting(false);
    }, 600);
  };

  // ─── Header & footer per step ─────────────────────────────────────────────

  const isPinStep = step === "pin";
  const isSuccessStep = step === "success";

  const headerIcon = isPinStep ? (
    <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
      <Lock className="w-4 h-4" />
    </div>
  ) : isSuccessStep ? (
    <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
      <CheckCircle2 className="w-4 h-4" />
    </div>
  ) : (
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
      <ArrowUpRight className="w-4 h-4" />
    </div>
  );

  const title = isPinStep
    ? "Confirm with your PIN"
    : isSuccessStep
      ? requiresApproval
        ? "Sent for approval"
        : "Transfer recorded"
      : "Transfer Money";

  const description = isPinStep
    ? "Enter your 4-digit transaction PIN to authorise this transfer."
    : isSuccessStep
      ? undefined
      : "Log an outgoing expense or move funds out of the expense account.";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size="lg"
      headerIcon={headerIcon}
      footer={
        isSuccessStep ? (
          <div className="flex justify-end">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : isPinStep ? (
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              className="text-slate-600 hover:bg-slate-100"
              onClick={() => setStep("form")}
              disabled={submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="border-slate-200 flex-1 sm:flex-none"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                onClick={handlePinConfirm}
                disabled={submitting || pin.join("").length !== 4}
              >
                {submitting
                  ? "Verifying..."
                  : requiresApproval
                    ? "Authorise & submit"
                    : "Authorise transfer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              {requiresApproval
                ? "Above approval threshold — will be sent for review."
                : "Auto-approved (below threshold) once PIN is confirmed."}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="border-slate-200 flex-1 sm:flex-none"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                onClick={handleFormSubmit}
              >
                Continue
              </Button>
            </div>
          </div>
        )
      }
    >
      {/* ─── Form step ───────────────────────────────────────────────────── */}
      {step === "form" && (
        <div className="space-y-5">
          {/* Source preview (read-only — one and only account) */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
            <div className="w-9 h-9 rounded-md bg-white border border-emerald-100 flex items-center justify-center text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
                From
              </p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {EXPENSE_ACCOUNT.name}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {EXPENSE_ACCOUNT.accountNumber}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">
                Available
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatToNaira(EXPENSE_ACCOUNT.balance)}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="transfer-amount" className="font-semibold">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-500">
                ₦
              </span>
              <Input
                id="transfer-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="pl-7 text-lg font-semibold h-12"
              />
            </div>
            {overBalance && (
              <p className="text-[11px] text-rose-600">
                Amount exceeds the expense account balance.
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="font-semibold">Expense Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">+ Create new category…</SelectItem>
              </SelectContent>
            </Select>
            {category === "__custom__" && (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="New category name"
                className="mt-1"
              />
            )}
          </div>

          {/* Narration */}
          <div className="space-y-2">
            <Label htmlFor="transfer-narration" className="font-semibold">
              Narration
            </Label>
            <Textarea
              id="transfer-narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={3}
              placeholder="What is this transfer for?"
              className="resize-none"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="font-semibold flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              Supporting documents{" "}
              <span className="text-xs font-normal text-gray-400">
                (optional, max 5)
              </span>
            </Label>

            <label
              className={cn(
                "block border-2 border-dashed border-emerald-200 bg-emerald-50/40 rounded-lg p-4 text-center cursor-pointer hover:bg-emerald-50 transition-colors",
                attachments.length >= 5 && "opacity-50 cursor-not-allowed",
              )}
            >
              <ImagePlus className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
              <p className="text-xs font-semibold text-emerald-800">
                Add receipts or invoices
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Up to 10 MB each
              </p>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  handleAttach(e.target.files);
                  e.target.value = "";
                }}
                disabled={attachments.length >= 5}
              />
            </label>

            {attachments.length > 0 && (
              <ul className="space-y-1.5">
                {attachments.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 p-2 rounded-md border border-slate-200 bg-white text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate text-slate-700">{f.name}</span>
                      <span className="text-slate-400 shrink-0">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ─── PIN step ─────────────────────────────────────────────────────── */}
      {step === "pin" && (
        <div className="space-y-5">
          {/* Summary of what we're authorising */}
          <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              You're transferring
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {formatToNaira(amountNum)}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                {effectiveCategory}
              </span>
              <span className="truncate">{narration}</span>
            </div>
          </div>

          {/* PIN grid */}
          <div className="space-y-3">
            <Label className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              Transaction PIN
            </Label>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    pinRefs.current[i] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  pattern="\d{1}"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setPinDigit(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  onPaste={handlePinPaste}
                  disabled={submitting}
                  aria-label={`PIN digit ${i + 1}`}
                  className={cn(
                    "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-lg border-2 outline-none transition-colors",
                    pinError
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : digit
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-900",
                    "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
                  )}
                />
              ))}
            </div>
            {pinError && (
              <p className="text-center text-[11px] text-rose-600">
                Wrong PIN — try again.
              </p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your transaction PIN is never shared. We use it only to confirm
              that you initiated this transfer.
            </p>
          </div>
        </div>
      )}

      {/* ─── Success step ─────────────────────────────────────────────────── */}
      {step === "success" && (
        <div className="py-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-base font-bold text-slate-900">
            {requiresApproval
              ? "Submitted for approval"
              : "Transfer recorded"}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
            {requiresApproval
              ? `${formatToNaira(amountNum)} under ${effectiveCategory} is now waiting on a manager.`
              : `${formatToNaira(amountNum)} under ${effectiveCategory} has been logged against your expense account.`}
          </p>
        </div>
      )}
    </CustomModal>
  );
};

export default TransferMoneyModal;
