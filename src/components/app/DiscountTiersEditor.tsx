"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateProductDiscount,
  DiscountTierFormRow,
  emptyTierRow,
  tierRangeLabel,
  tierRowsToPayload,
  validateTiers,
} from "@/utils/discountTiers";
import { formatToNaira } from "@/utils/formatMoney";
import { Plus, Trash2 } from "lucide-react";

interface DiscountTiersEditorProps {
  rows: DiscountTierFormRow[];
  onChange: (rows: DiscountTierFormRow[]) => void;
  /** Used for the fixed-amount limit and the unit price preview. */
  sellingPrice?: number;
}

/**
 * Bulk pricing tiers for one product or variation. Each tier is a quantity
 * range; reaching it discounts every unit on the line. Leave "Max" blank on
 * the last tier for "and above".
 */
const DiscountTiersEditor = ({
  rows,
  onChange,
  sellingPrice,
}: DiscountTiersEditorProps) => {
  const price = Number(sellingPrice) || 0;
  const tiers = tierRowsToPayload(rows);
  const error = validateTiers(tiers, price || null);

  const update = (index: number, patch: Partial<DiscountTierFormRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addTier = () => {
    const last = rows[rows.length - 1];
    const next = emptyTierRow();
    // Start where the previous tier ends, closing it off if it was open.
    if (last?.min_quantity) {
      const lastMax = last.max_quantity || last.min_quantity;
      next.min_quantity = String(Number(lastMax) + 1);
      if (!last.max_quantity) {
        onChange([
          ...rows.slice(0, -1),
          { ...last, max_quantity: last.min_quantity },
          { ...next, min_quantity: String(Number(last.min_quantity) + 1) },
        ]);
        return;
      }
    }
    onChange([...rows, next]);
  };

  return (
    <div className="w-full space-y-3">
      <div>
        <p className="text-sm font-bold text-grey-1">Bulk discounts</p>
        <p className="text-xs text-grey-3">
          Give a discount when customers buy more. Once a tier is reached, every
          unit gets that discount. Leave Max blank on the last tier for
          &quot;and above&quot;.
        </p>
      </div>

      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1.3fr_1fr_auto] gap-2 text-[11px] font-medium text-grey-3">
            <span>Min qty</span>
            <span>Max qty</span>
            <span>Discount type</span>
            <span>Value</span>
            <span className="w-8" />
          </div>
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1.3fr_1fr_auto] gap-2 rounded-lg border border-grey-5 p-2 sm:border-0 sm:p-0"
            >
              <Input
                inputMode="numeric"
                placeholder="Min"
                value={row.min_quantity}
                onChange={(e) =>
                  update(index, {
                    min_quantity: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              <Input
                inputMode="numeric"
                placeholder="No limit"
                value={row.max_quantity}
                onChange={(e) =>
                  update(index, {
                    max_quantity: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              <Select
                value={row.discount_type}
                onValueChange={(value) =>
                  update(index, { discount_type: value as DiscountTierFormRow["discount_type"] })
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">
                    Fixed amount (₦ per unit)
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Input
                  inputMode="decimal"
                  placeholder={row.discount_type === "PERCENTAGE" ? "%" : "₦"}
                  value={row.discount_value}
                  onChange={(e) =>
                    update(index, {
                      discount_value: e.target.value.replace(/[^\d.]/g, ""),
                    })
                  }
                />
              </div>
              <button
                type="button"
                aria-label={`Remove tier ${index + 1}`}
                className="justify-self-end sm:justify-self-auto h-9 w-8 flex items-center justify-center rounded-md text-error-1 hover:bg-error-2"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && rows.length > 0 && (
        <p className="text-xs font-medium text-error-1">{error}</p>
      )}

      {/* What the customer pays per unit in each tier */}
      {!error && price > 0 && tiers.length > 0 && (
        <div className="rounded-lg bg-secondary-6 p-2.5 text-xs text-grey-2 space-y-0.5">
          {tiers.map((tier, index) => {
            const result = calculateProductDiscount(
              price,
              tier.min_quantity,
              [tier],
            );
            return (
              <p key={index}>
                <span className="font-bold">{tierRangeLabel(tier)} units:</span>{" "}
                {formatToNaira(result.discountedUnitPrice)} each
              </p>
            );
          })}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addTier}>
        <Plus className="h-4 w-4 mr-1" />
        {rows.length ? "Add another tier" : "Add a tier"}
      </Button>
    </div>
  );
};

export default DiscountTiersEditor;
