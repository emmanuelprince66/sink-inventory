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
import { useToast } from "@/hooks/toast/useToast";
import {
  useExpenseBudgetActions,
  useExpenseCategoryOptions,
} from "@/hooks/useExpenseAccountsHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Calculator,
  CalendarRange,
  PiggyBank,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getCategoryMeta } from "./expense-ui-meta";

interface ExistingBudget {
  id: string;
  year?: number;
  total_budget_amount_formatted?: number;
  duration_months?: number;
}

interface SetCategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-set when opened from a specific category's context (card / detail
   * page). Omit both to let the user pick a category — used by the
   * standalone Budgets screen's "Create Budget" flow. */
  categoryId?: string;
  categoryName?: string;
  existingBudget?: ExistingBudget;
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

const SetCategoryBudgetModal = ({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  existingBudget,
}: SetCategoryBudgetModalProps) => {
  const { showToast } = useToast();
  const isCategoryLocked = Boolean(categoryId);

  const { categoryOptions } = useExpenseCategoryOptions();

  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || "");
  const selectedCategoryName =
    categoryName ||
    categoryOptions.find((c) => c.id === selectedCategoryId)?.name ||
    "";
  const meta = getCategoryMeta(selectedCategoryName || "Other");
  const CatIcon = meta.icon;

  const {
    submitBudget,
    createBudgetLoading,
    editBudgetLoading,
    deleteBudget,
    deleteBudgetLoading,
  } = useExpenseBudgetActions();

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("6");
  const [year, setYear] = useState(String(currentYear));

  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(categoryId || "");
      setAmount(
        existingBudget?.total_budget_amount_formatted
          ? String(existingBudget.total_budget_amount_formatted)
          : "",
      );
      setDuration(
        existingBudget?.duration_months
          ? String(existingBudget.duration_months)
          : "6",
      );
      setYear(String(existingBudget?.year || currentYear));
    }
  }, [isOpen, existingBudget, categoryId]);

  const submitting = createBudgetLoading || editBudgetLoading;
  const amountNum = parseFloat(amount) || 0;
  const durationNum = parseInt(duration, 10) || 0;
  const yearNum = parseInt(year, 10) || currentYear;
  const monthly =
    amountNum > 0 && durationNum > 0 ? amountNum / durationNum : 0;

  const handleSubmit = () => {
    if (!selectedCategoryId) {
      showToast("Select a category for this budget.", "error");
      return;
    }
    if (amountNum <= 0) {
      showToast("Enter a budget amount greater than zero.", "error");
      return;
    }
    if (durationNum <= 0) {
      showToast("Duration must be at least 1 month.", "error");
      return;
    }
    submitBudget(
      {
        category_id: selectedCategoryId,
        year: yearNum,
        total_budget_amount: amountNum,
        duration_months: durationNum,
      },
      existingBudget?.id,
      onClose,
    );
  };

  const handleRemove = () => {
    if (!existingBudget?.id) return;
    deleteBudget(existingBudget.id, { onSuccess: onClose });
  };

  const titleCategory = selectedCategoryName || "budget";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        existingBudget
          ? `Edit ${titleCategory} budget`
          : isCategoryLocked
            ? `Set ${titleCategory} budget`
            : "Create budget"
      }
      description="Set a total amount and how long it should cover. We'll auto-calculate the monthly target."
      size="md"
      headerIcon={
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center border",
            meta.tone,
          )}
        >
          <CatIcon className="w-4 h-4" />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-between">
          {existingBudget ? (
            <Button
              variant="ghost"
              className="text-error-1 hover:bg-error-2 hover:text-error-1"
              onClick={handleRemove}
              disabled={submitting || deleteBudgetLoading}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {deleteBudgetLoading ? "Removing..." : "Remove budget"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              <PiggyBank className="w-4 h-4 mr-1.5" />
              {submitting
                ? "Saving..."
                : existingBudget
                  ? "Save changes"
                  : "Set budget"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Category — only shown when not opened from a fixed category context */}
        {!isCategoryLocked && (
          <div className="space-y-2">
            <Label htmlFor="budget-category" className="font-semibold">
              Category
            </Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              disabled={submitting || Boolean(existingBudget)}
            >
              <SelectTrigger id="budget-category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Total budget */}
        <div className="space-y-2">
          <Label htmlFor="budget-amount" className="font-semibold">
            Total Budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-grey-3">
              ₦
            </span>
            <Input
              id="budget-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="pl-7 text-lg font-semibold h-12"
              disabled={submitting}
            />
          </div>
          <p className="text-[11px] text-grey-3">
            The total you're willing to spend
            {selectedCategoryName ? ` on ${selectedCategoryName}` : ""} over
            the duration below.
          </p>
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="budget-year" className="font-semibold">
            Year
          </Label>
          <Select value={year} onValueChange={setYear} disabled={submitting}>
            <SelectTrigger id="budget-year" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="budget-duration" className="font-semibold">
            Duration{" "}
            <span className="text-xs font-normal text-grey-4">
              (in months)
            </span>
          </Label>
          <div className="flex gap-2 flex-wrap">
            {[1, 3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(String(m))}
                disabled={submitting}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer",
                  duration === String(m)
                    ? "bg-primary-green-300 border-primary-green-300 text-white"
                    : "bg-white border-grey-5 text-grey-2 hover:border-primary-green-300/40",
                )}
              >
                {m} {m === 1 ? "month" : "months"}
              </button>
            ))}
          </div>
          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-3" />
            <Input
              id="budget-duration"
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="6"
              className="pl-10"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Auto-calculated preview */}
        <div className="rounded-xl border border-primary-green-300/20 bg-secondary-6 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-primary-green-300" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-green-100">
              System calculates
            </p>
          </div>
          <p className="text-2xl font-bold text-grey-1">
            {monthly > 0 ? `${formatToNaira(monthly)} / month` : "—"}
          </p>
          <p className="text-[11px] text-grey-3 mt-1.5 leading-relaxed flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary-green-300" />
            We deduct each expense logged under{" "}
            <span className="font-bold">
              {selectedCategoryName || "this category"}
            </span>{" "}
            from this monthly target.
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default SetCategoryBudgetModal;
