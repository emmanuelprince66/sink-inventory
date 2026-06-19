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
import { ArrowUpRight, ImagePlus, Info, Paperclip, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  EXPENSE_CATEGORIES,
  MOCK_ACCOUNTS,
  getAccountById,
} from "./mock-data";

interface TransferMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional pre-selected source account. */
  defaultSourceId?: string;
}

const TransferMoneyModal = ({
  isOpen,
  onClose,
  defaultSourceId,
}: TransferMoneyModalProps) => {
  const { showToast } = useToast();
  const [sourceId, setSourceId] = useState<string>(
    defaultSourceId || MOCK_ACCOUNTS[0].id,
  );
  const [destinationId, setDestinationId] = useState<string>("__external__");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [narration, setNarration] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && defaultSourceId) {
      setSourceId(defaultSourceId);
    }
  }, [isOpen, defaultSourceId]);

  const source = getAccountById(sourceId);
  const isInternal = destinationId !== "__external__";
  const effectiveCategory =
    category === "__custom__" ? customCategory.trim() : category;
  const amountNum = parseFloat(amount) || 0;
  const overBalance = source ? amountNum > source.balance : false;
  const requiresApproval = useMemo(() => {
    if (!source || amountNum <= 0) return false;
    return amountNum > source.approvalThreshold;
  }, [source, amountNum]);

  const reset = () => {
    setSourceId(defaultSourceId || MOCK_ACCOUNTS[0].id);
    setDestinationId("__external__");
    setAmount("");
    setCategory(EXPENSE_CATEGORIES[0]);
    setCustomCategory("");
    setNarration("");
    setAttachments([]);
    setSubmitting(false);
  };

  const handleAttach = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((f) => f.size <= 10 * 1024 * 1024);
    setAttachments((prev) => [...prev, ...next].slice(0, 5));
  };
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!sourceId) {
      showToast("Pick a source account.", "error");
      return;
    }
    if (amountNum <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    if (overBalance) {
      showToast("Amount exceeds the source account balance.", "error");
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

    setSubmitting(true);
    setTimeout(() => {
      showToast(
        requiresApproval
          ? "Transfer submitted for approval."
          : "Transfer recorded successfully.",
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
      title="Transfer Money"
      description="Move funds between accounts or record an outgoing expense."
      size="lg"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            {requiresApproval
              ? "Amount exceeds the source account's threshold — will need approval."
              : "Approved instantly when below the source account's threshold."}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="border-slate-200 flex-1 sm:flex-none"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : requiresApproval
                  ? "Submit for approval"
                  : "Confirm transfer"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Source / destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="font-semibold">Source Account</Label>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_ACCOUNTS.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} — {formatToNaira(acc.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {source && (
              <p className="text-[11px] text-slate-500">
                Available: {formatToNaira(source.balance)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Destination</Label>
            <Select value={destinationId} onValueChange={setDestinationId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__external__">
                  External (outgoing expense)
                </SelectItem>
                {MOCK_ACCOUNTS.filter((a) => a.id !== sourceId).map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500">
              {isInternal
                ? "Move funds between two expense accounts."
                : "Record an outgoing expense (no internal destination)."}
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
              disabled={submitting}
            />
          </div>
          {overBalance && (
            <p className="text-[11px] text-rose-600">
              Amount exceeds the source account balance.
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
              disabled={submitting}
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
            disabled={submitting}
          />
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <Label className="font-semibold flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-slate-500" />
            Supporting documents{" "}
            <span className="text-xs font-normal text-gray-400">
              (optional, max 5 files)
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
              disabled={attachments.length >= 5 || submitting}
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

    </CustomModal>
  );
};

export default TransferMoneyModal;
