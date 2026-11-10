"use client";

import {
  calculateRealizedMargin,
  calculateSuggestedSellingPrice,
} from "@/utils/autoPricing";
import { formatToNaira } from "@/utils/formatMoney";
import { useWatch } from "react-hook-form";

/**
 * Under a selling price field: whether it's the automatic price or a custom one,
 * with a way back to the suggested price. Watches its own two fields, so a long
 * form doesn't re-render on every keystroke.
 */
const AutoPriceHint = ({
  control,
  setValue,
  costName,
  sellingName,
  margin,
}: {
  control: any;
  setValue: (name: any, value: any, options?: any) => void;
  costName: string;
  sellingName: string;
  margin: number;
}) => {
  const cost = useWatch({ control, name: costName });
  const selling = useWatch({ control, name: sellingName });

  const suggested = calculateSuggestedSellingPrice(cost, margin);
  const isCustom =
    suggested > 0 &&
    Boolean(selling) &&
    Number(String(selling).replace(/,/g, "")) !== suggested;

  if (!isCustom) {
    return (
      <span className="mt-1 inline-block rounded-full bg-success-2 px-2 py-0.5 text-[10px] font-bold text-success-1">
        Auto ({margin}% margin)
      </span>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="rounded-full bg-warning-2 px-2 py-0.5 text-[10px] font-bold text-grey-1">
        Custom override · {calculateRealizedMargin(cost, selling)}% margin
      </span>
      <button
        type="button"
        className="cursor-pointer text-[11px] font-bold text-primary-green-300 underline"
        onClick={() =>
          setValue(sellingName, String(suggested), {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      >
        Reset to suggested price ({formatToNaira(suggested)})
      </button>
    </div>
  );
};

export default AutoPriceHint;
