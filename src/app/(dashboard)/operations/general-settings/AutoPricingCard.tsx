"use client";

import { useUpdateBusinessMutation } from "@/api/business/create-business";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { calculateSuggestedSellingPrice } from "@/utils/autoPricing";
import { formatToNaira } from "@/utils/formatMoney";
import { Percent } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Works out a product's selling price from its cost and a target profit margin.
 * Unlike the plain on/off cards, this has settings to fill in first, and turning
 * it on needs a margin, so changes wait for Save.
 */
const AutoPricingCard = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data: BusinessData } = useFetchBusinessById(business_id);
  const business = BusinessData?.data;

  const savedEnabled = business?.auto_calculate_selling_price === true;
  const savedMargin =
    Number(business?.target_profit_margin) > 0
      ? String(Number(business.target_profit_margin))
      : "";
  const savedRecalculate = business?.recalculate_prices_on_cost_change !== false;

  const [enabled, setEnabled] = useState(false);
  const [margin, setMargin] = useState("");
  const [recalculate, setRecalculate] = useState(true);

  // Follows the saved values, including after a save refetches them.
  useEffect(() => {
    setEnabled(savedEnabled);
    setMargin(savedMargin);
    setRecalculate(savedRecalculate);
  }, [savedEnabled, savedMargin, savedRecalculate]);

  const { mutate: updateBusiness, isPending } = useUpdateBusinessMutation();

  const marginValue = Number(margin);
  const marginError =
    enabled && !(marginValue > 0 && marginValue < 100)
      ? "Enter a margin above 0% and below 100%."
      : null;

  const isDirty =
    enabled !== savedEnabled ||
    (enabled && margin !== savedMargin) ||
    (enabled && recalculate !== savedRecalculate);

  const handleSave = () => {
    if (!business_id || marginError) return;
    const formData = new FormData();
    formData.append("business_id", business_id);
    formData.append("auto_calculate_selling_price", String(enabled));
    if (enabled) {
      formData.append("target_profit_margin", marginValue.toFixed(2));
      formData.append("recalculate_prices_on_cost_change", String(recalculate));
    }
    updateBusiness(formData);
  };

  const example = calculateSuggestedSellingPrice(8000, marginValue);

  return (
    <div className="rounded-xl border border-grey-5 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-6">
          <Percent className="h-5 w-5 text-primary-green-300" />
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={isPending || !business_id}
          aria-label="Automatic selling price"
        />
      </div>

      <div className="mb-1 flex items-center gap-2">
        <h5 className="text-sm font-bold text-grey-1">
          Automatic selling price
        </h5>
        {savedEnabled && (
          <span className="rounded-full bg-success-2 px-2 py-0.5 text-[10px] font-bold text-success-1">
            On
          </span>
        )}
      </div>

      <p className="text-xs text-grey-3">
        Work out a product&apos;s selling price from its cost and your target
        profit margin. You can still type your own price on any product.
      </p>

      {enabled && (
        <div className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="target-profit-margin"
              className="mb-1 block text-xs font-medium text-grey-2"
            >
              Target profit margin (%)
            </label>
            <Input
              id="target-profit-margin"
              inputMode="decimal"
              placeholder="e.g. 20"
              value={margin}
              onChange={(e) =>
                setMargin(e.target.value.replace(/[^\d.]/g, ""))
              }
            />
            {marginError && margin !== "" ? (
              <p className="mt-1 text-[11px] font-medium text-error-1">
                {marginError}
              </p>
            ) : example > 0 ? (
              <p className="mt-1 text-[11px] text-grey-3">
                A cost of {formatToNaira(8000)} sells at{" "}
                {formatToNaira(example)}.
              </p>
            ) : null}
          </div>

          <label className="flex cursor-pointer items-start gap-2">
            <Checkbox
              className="mt-0.5"
              checked={recalculate}
              onCheckedChange={(checked) => setRecalculate(checked === true)}
            />
            <span className="text-xs text-grey-2">
              Automatically recalculate selling prices when cost price changes
            </span>
          </label>
        </div>
      )}

      {isDirty && (
        <Button
          type="button"
          size="sm"
          className="mt-3 min-w-[80px] bg-primary-green-300 text-white"
          disabled={isPending || !!marginError}
          onClick={handleSave}
        >
          {isPending ? <Spinner /> : "Save"}
        </Button>
      )}
    </div>
  );
};

export default AutoPricingCard;
