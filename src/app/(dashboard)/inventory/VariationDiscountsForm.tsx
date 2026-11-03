import {
  clearOldDiscount,
  fetchDiscountThresholds,
  saveDiscountThresholds,
} from "@/api/products/discount-thresholds";
import DiscountTiersEditor from "@/components/app/DiscountTiersEditor";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import {
  calculateProductDiscount,
  describeDiscount,
  DiscountTierFormRow,
  tierRangeLabel,
  tierRowsFromItem,
  tierRowsToPayload,
  validateTiers,
} from "@/utils/discountTiers";
import { formatToNaira } from "@/utils/formatMoney";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type RowsById = Record<string, DiscountTierFormRow[]>;

const payloadKey = (rows: DiscountTierFormRow[] = []) =>
  JSON.stringify(tierRowsToPayload(rows));

/** Variation names are stored as "Parent - Combination". */
const shortName = (name?: string) =>
  name?.includes(" - ")
    ? name.split(" - ").slice(1).join(" - ")
    : (name ?? "Variation");

/** Lowest price a tier sells at, to warn before selling below cost. */
const deepestUnitPrice = (rows: DiscountTierFormRow[], price: number) => {
  const tiers = tierRowsToPayload(rows);
  if (!tiers.length) return price;
  return Math.min(
    ...tiers.map(
      (tier) =>
        calculateProductDiscount(price, Number(tier.min_quantity), [tier])
          .discountedUnitPrice,
    ),
  );
};

/**
 * Bulk discounts for a product with variations, from the inventory list. Each
 * variation has its own tiers and is saved on its own, so only what changed
 * goes up, and one failing doesn't lose the others.
 */
const VariationDiscountsForm = ({
  product,
  closeModal,
}: {
  product: any;
  closeModal: any;
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const variations: any[] = useMemo(
    () => product?.variations ?? [],
    [product],
  );

  // The list should carry each variation's tiers. Any it doesn't are read from
  // the server first, so saving can't overwrite tiers this screen never saw.
  const { data: fetched, isLoading } = useQuery({
    queryKey: ["variation-discount-thresholds", product?.id],
    queryFn: async () => {
      const missing = variations.filter(
        (variation) => !Array.isArray(variation.discount_thresholds),
      );
      const entries = await Promise.all(
        missing.map(
          async (variation) =>
            [variation.id, await fetchDiscountThresholds(variation.id)] as const,
        ),
      );
      return Object.fromEntries(entries);
    },
    enabled: variations.length > 0,
    // Never open on an old copy.
    gcTime: 0,
  });

  const [rows, setRows] = useState<RowsById>({});
  /** What's on the server, to tell what changed. */
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [allRows, setAllRows] = useState<DiscountTierFormRow[]>([]);
  const [failures, setFailures] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Once per opening: saving refreshes the list, and that mustn't reset the
  // rows, or a variation that failed to save would lose what was typed.
  const initialised = useRef(false);
  const oldDiscountCleared = useRef(new Set<string>());
  useEffect(() => {
    if (!fetched || initialised.current) return;
    initialised.current = true;
    const initial: RowsById = {};
    variations.forEach((variation) => {
      initial[variation.id] = tierRowsFromItem({
        ...variation,
        discount_thresholds:
          fetched[variation.id] ?? variation.discount_thresholds,
      });
    });
    setRows(initial);
    setSaved(
      Object.fromEntries(
        Object.entries(initial).map(([id, list]) => [id, payloadKey(list)]),
      ),
    );
  }, [fetched, variations]);

  const priceOf = (variation: any) => Number(variation.selling_price) || 0;

  const errors = useMemo(() => {
    const found: Record<string, string> = {};
    variations.forEach((variation) => {
      const error = validateTiers(
        tierRowsToPayload(rows[variation.id]),
        priceOf(variation) || null,
      );
      if (error) found[variation.id] = error;
    });
    return found;
  }, [rows, variations]);

  const changedIds = variations
    .map((variation) => variation.id as string)
    .filter((id) => payloadKey(rows[id]) !== saved[id]);
  const hasErrors = Object.keys(errors).length > 0;

  const updateRows = (id: string, next: DiscountTierFormRow[]) => {
    setRows((current) => ({ ...current, [id]: next }));
    setFailures(({ [id]: _cleared, ...rest }) => rest);
  };

  const cheapest = Math.min(
    ...variations.map((variation) => priceOf(variation) || Infinity),
  );

  const applyToAll = () => {
    const next: RowsById = {};
    variations.forEach((variation) => {
      next[variation.id] = allRows.map((row) => ({ ...row }));
    });
    setRows(next);
    setFailures({});
    setAllOpen(false);
    setOpenId(null);
  };

  const handleSave = async () => {
    if (hasErrors || !changedIds.length) return;
    setSaving(true);
    const failed: Record<string, string> = {};
    const nowSaved: Record<string, string> = {};
    for (const id of changedIds) {
      try {
        await saveDiscountThresholds(id, tierRowsToPayload(rows[id]));
        // Tiers replace the older single discount, shown here as tier 1. Left
        // on, it would come back the moment the tiers were removed.
        const variation = variations.find((item) => item.id === id);
        if (
          !oldDiscountCleared.current.has(id) &&
          (Number(variation?.discount) > 0 ||
            Number(variation?.discount_threshold) > 0)
        ) {
          await clearOldDiscount(id);
          oldDiscountCleared.current.add(id);
        }
        nowSaved[id] = payloadKey(rows[id]);
      } catch (error) {
        failed[id] =
          error instanceof Error ? error.message : "Couldn't save this one";
      }
    }
    setSaved((current) => ({ ...current, ...nowSaved }));
    setFailures(failed);
    setSaving(false);

    if (Object.keys(nowSaved).length) {
      queryClient.invalidateQueries({
        queryKey: [queryKey.inventory.getAllInventory],
      });
      queryClient.invalidateQueries({
        queryKey: ["variation-discount-thresholds", product?.id],
      });
    }

    const failedCount = Object.keys(failed).length;
    if (failedCount) {
      showToast(
        `${failedCount} variation${failedCount === 1 ? "" : "s"} couldn't save. Press Save to try ${failedCount === 1 ? "it" : "them"} again.`,
        "error",
      );
      return;
    }
    showToast("Bulk discounts saved", "success");
    closeModal?.();
  };

  if (isLoading || !fetched) {
    return (
      <div className="space-y-3">
        {Array.from({ length: Math.min(variations.length, 4) }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl bg-grey-5" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {allOpen ? (
        <div className="space-y-3 rounded-xl border border-grey-5 p-3">
          <DiscountTiersEditor
            rows={allRows}
            onChange={setAllRows}
            // Cheapest variation, so a fixed discount fits every one.
            sellingPrice={Number.isFinite(cheapest) ? cheapest : undefined}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAllOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-primary-green-300 text-white"
              disabled={
                !tierRowsToPayload(allRows).length ||
                !!validateTiers(
                  tierRowsToPayload(allRows),
                  Number.isFinite(cheapest) ? cheapest : null,
                )
              }
              onClick={applyToAll}
            >
              Apply to all {variations.length} variations
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setAllRows([]);
            setAllOpen(true);
            setOpenId(null);
          }}
        >
          Apply the same tiers to all
        </Button>
      )}

      <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
        {variations.map((variation) => {
          const id: string = variation.id;
          const list = rows[id] ?? [];
          const tiers = tierRowsToPayload(list);
          const isOpen = openId === id;
          const error = errors[id];
          const failure = failures[id];
          const price = priceOf(variation);
          const cost = Number(variation.cost_price) || 0;
          const belowCost =
            tiers.length > 0 &&
            !error &&
            cost > 0 &&
            deepestUnitPrice(list, price) < cost;

          return (
            <div
              key={id}
              className={cn(
                "overflow-hidden rounded-xl border",
                error || failure ? "border-error-1/50" : "border-grey-5",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center gap-3 p-3 text-left hover:bg-grey-6/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-grey-1">
                    {shortName(variation.name)}
                  </p>
                  <p
                    className={cn(
                      "truncate text-xs",
                      error ? "font-medium text-error-1" : "text-grey-3",
                    )}
                  >
                    {error
                      ? "Needs fixing"
                      : tiers.length
                        ? tiers
                            .map(
                              (tier) =>
                                `${tierRangeLabel(tier)}: ${describeDiscount(tier.discount_type, tier.discount_value)}`,
                            )
                            .join(" · ")
                        : "No bulk discount"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-grey-2">
                  {formatToNaira(price)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-grey-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {failure && (
                <p className="border-t border-error-1/20 bg-error-2 px-3 py-2 text-xs font-medium text-error-1">
                  Couldn&apos;t save: {failure}
                </p>
              )}

              {isOpen && (
                <div className="space-y-3 border-t border-grey-6 p-3">
                  <DiscountTiersEditor
                    rows={list}
                    onChange={(next) => updateRows(id, next)}
                    sellingPrice={price}
                  />
                  {belowCost && (
                    <div className="flex items-start gap-2 rounded-lg border border-error-1/30 bg-error-2 p-2.5">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error-1" />
                      <p className="text-xs font-medium text-error-1">
                        Its deepest tier sells at{" "}
                        {formatToNaira(deepestUnitPrice(list, price))} per unit,
                        below the cost price of {formatToNaira(cost)}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-grey-5 pt-3">
        <Button type="button" variant="outline" onClick={() => closeModal?.()}>
          Cancel
        </Button>
        <Button
          type="button"
          className="min-w-[120px] bg-primary-green-300 text-white"
          disabled={saving || hasErrors || !changedIds.length}
          onClick={handleSave}
        >
          {saving ? <Spinner /> : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default VariationDiscountsForm;
