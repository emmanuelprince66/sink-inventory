"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { Calculator, CalendarRange, PiggyBank, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryBudget, getCategoryMeta } from "./mock-data";

interface SetCategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Category name (also used for the header tone). */
  category: string;
  /** Current budget if one exists. */
  current?: CategoryBudget;
}

const SetCategoryBudgetModal = ({
  isOpen,
  onClose,
  category,
  current,
}: SetCategoryBudgetModalProps) => {
  const { showToast } = useToast();
  const meta = getCategoryMeta(category);
  const CatIcon = meta.icon;

  const [budget, setBudget] = useState(
    current?.budget ? String(current.budget) : "",
  );
  const [duration, setDuration] = useState(
    current?.durationMonths ? String(current.durationMonths) : "6",
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBudget(current?.budget ? String(current.budget) : "");
      setDuration(
        current?.durationMonths ? String(current.durationMonths) : "6",
      );
    }
  }, [isOpen, current]);

  const budgetNum = parseFloat(budget) || 0;
  const durationNum = parseInt(duration, 10) || 0;
  const monthly =
    budgetNum > 0 && durationNum > 0 ? budgetNum / durationNum : 0;

  const handleSubmit = () => {
    if (budgetNum <= 0) {
      showToast("Enter a budget amount greater than zero.", "error");
      return;
    }
    if (durationNum <= 0) {
      showToast("Duration must be at least 1 month.", "error");
      return;
    }
    setSubmitting(true);
    // UI-only — wire to PUT /expense-budgets/{business_id}/{category}/ when ready.
    setTimeout(() => {
      showToast(`Budget for ${category} saved.`, "success");
      setSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={current ? `Edit ${category} budget` : `Set ${category} budget`}
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
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <PiggyBank className="w-4 h-4 mr-1.5" />
            {submitting ? "Saving..." : current ? "Save changes" : "Set budget"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Total budget */}
        <div className="space-y-2">
          <Label htmlFor="budget-amount" className="font-semibold">
            Total Budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-500">
              ₦
            </span>
            <Input
              id="budget-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0"
              className="pl-7 text-lg font-semibold h-12"
              disabled={submitting}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            The total you're willing to spend on {category} over the duration
            below.
          </p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="budget-duration" className="font-semibold">
            Duration{" "}
            <span className="text-xs font-normal text-gray-400">
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
                  "px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  duration === String(m)
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-200",
                )}
              >
                {m} {m === 1 ? "month" : "months"}
              </button>
            ))}
          </div>
          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
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
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-emerald-700" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
              System calculates
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {monthly > 0 ? `${formatToNaira(monthly)} / month` : "—"}
          </p>
          <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            We deduct each expense logged under{" "}
            <span className="font-semibold">{category}</span> from this monthly
            target.
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default SetCategoryBudgetModal;
