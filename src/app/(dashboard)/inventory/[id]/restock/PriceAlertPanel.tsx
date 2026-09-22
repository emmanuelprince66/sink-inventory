import { Spinner } from "@/components/app/Spinner";
import type { RestockPriceAlert } from "@/hooks/useGetRestockHistory";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";

/**
 * Shown in place of the restock form once the stock is saved, when the
 * purchase cost has moved enough to eat into the margin. The restock itself
 * already succeeded — this only decides the selling price going forward.
 */
const PriceAlertPanel = ({
  alert,
  currentSellingPrice,
  forVariation,
  applying,
  onApply,
  onKeep,
}: {
  alert: RestockPriceAlert;
  currentSellingPrice?: number;
  /** A variant's price isn't on the product, so it's edited by hand. */
  forVariation: boolean;
  applying: boolean;
  onApply: () => void;
  onKeep: () => void;
}) => {
  const change = Number(alert.percentage_change);
  const rose = change > 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-primary-green-300">
        <CheckCircle2 className="w-4 h-4" />
        Stock added
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-grey-1">
              {rose
                ? `Your cost went up ${change.toFixed(1)}%`
                : "Your margin on this product is getting thin"}
            </p>
            <p className="text-xs text-grey-3 mt-0.5">
              At the old selling price you&apos;ll earn less on every sale.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-white p-3">
          <div className="text-center">
            <p className="text-[10px] text-grey-3">Previous cost</p>
            <p className="text-sm font-extrabold text-grey-2">
              {formatToNaira(alert.previous_cost_price)}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-grey-4" />
          <div className="text-center">
            <p className="text-[10px] text-grey-3">New cost</p>
            <p className="text-sm font-extrabold text-grey-1">
              {formatToNaira(alert.new_cost_price)}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-grey-3">Recommended selling price</p>
            <p className="text-base font-extrabold text-primary-green-300">
              {formatToNaira(alert.recommended_selling_price)}
            </p>
          </div>
          {currentSellingPrice ? (
            <div className="flex items-center justify-between gap-3 mt-1">
              <p className="text-xs text-grey-3">Current selling price</p>
              <p className="text-sm font-bold text-grey-2">
                {formatToNaira(currentSellingPrice)}
              </p>
            </div>
          ) : null}
          <p className="text-[11px] text-grey-3 mt-2">
            Keeps the same profit margin you had before the cost changed.
          </p>
        </div>

        {forVariation && (
          <p className="text-xs text-grey-2">
            This restock was for a variant. Update its price from{" "}
            <span className="font-bold">Edit Details</span> on the product.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onKeep}
          disabled={applying}
          className="h-11 rounded-xl border border-grey-5 bg-white text-sm font-bold text-grey-1 hover:bg-grey-6 cursor-pointer disabled:opacity-40"
        >
          {forVariation ? "Done" : "Keep current price"}
        </button>
        {!forVariation && (
          <button
            type="button"
            onClick={onApply}
            disabled={applying}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-green-300 text-sm font-bold text-white hover:bg-primary-green-300/90 cursor-pointer disabled:opacity-60"
          >
            {applying && <Spinner className="w-4 h-4 text-white" />}
            Use {formatToNaira(alert.recommended_selling_price)}
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceAlertPanel;
