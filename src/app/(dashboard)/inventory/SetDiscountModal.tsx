import {
  fetchDiscountThresholds,
  saveDiscountThresholds,
} from "@/api/products/discount-thresholds";
import DiscountTiersEditor from "@/components/app/DiscountTiersEditor";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useInventoryHook } from "@/hooks/useInventoryHook";
import {
  calculateProductDiscount,
  DiscountTierFormRow,
  tierRowsFromItem,
  tierRowsToPayload,
  tiersToFormRows,
  validateTiers,
} from "@/utils/discountTiers";
import { formatToNaira } from "@/utils/formatMoney";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import VariationDiscountsForm from "./VariationDiscountsForm";

/**
 * Bulk discount tiers for one product, from the inventory list. Loads the
 * saved tiers first, so saving never wipes ones this screen didn't show.
 */
const SingleProductDiscountForm = ({
  productId,
  product,
  closeModal,
}: {
  productId: any;
  closeModal: any;
  product: any;
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  // Used only to switch off the older single discount, if set.
  const { addDiscountSubmit, loading: clearingLegacy } = useInventoryHook({
    productId,
    product,
    closeModal,
  });

  const hasLegacy =
    Number(product?.discount) > 0 || Number(product?.discount_threshold) > 0;

  const { data: savedTiers, isLoading, isError } = useQuery({
    queryKey: ["product-discount-thresholds", productId],
    queryFn: () => fetchDiscountThresholds(productId),
    enabled: !!productId,
  });

  const [rows, setRows] = useState<DiscountTierFormRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!savedTiers) return;
    if (savedTiers.length) {
      setRows(tiersToFormRows(savedTiers));
    } else {
      // Older single discount, shown as tier 1.
      setRows(tierRowsFromItem({ ...product, discount_thresholds: [] }));
    }
  }, [savedTiers, product]);

  const sellingPrice = Number(product?.selling_price) || 0;
  const costPrice = Number(product?.cost_price) || 0;
  const tiers = tierRowsToPayload(rows);
  const error = validateTiers(tiers, sellingPrice || null);

  // Deepest discount across tiers, to warn before selling at a loss.
  const deepestUnitPrice = tiers.length
    ? Math.min(
        ...tiers.map(
          (tier) =>
            calculateProductDiscount(sellingPrice, tier.min_quantity, [tier])
              .discountedUnitPrice,
        ),
      )
    : sellingPrice;
  const showLossWarning =
    tiers.length > 0 && costPrice > 0 && deepestUnitPrice < costPrice;

  const handleSave = async () => {
    if (error) return;
    setSaving(true);
    try {
      await saveDiscountThresholds(productId, tiers);
      queryClient.invalidateQueries({
        queryKey: ["product-discount-thresholds", productId],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKey.inventory.getAllInventory],
      });
      if (hasLegacy) {
        // Closes the modal and refreshes when done.
        addDiscountSubmit({ product_threshold: "0", price_discount: "0" });
      } else {
        showToast("Bulk discounts saved", "success");
        closeModal?.();
      }
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Couldn't save the bulk discounts",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3 bg-grey-5" />
        <Skeleton className="h-9 w-full bg-grey-5" />
        <Skeleton className="h-9 w-full bg-grey-5" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {isError && (
        <p className="text-xs text-error-1">
          Couldn&apos;t load the saved tiers. Close and try again before saving.
        </p>
      )}

      <DiscountTiersEditor
        rows={rows}
        onChange={setRows}
        sellingPrice={sellingPrice}
      />

      {showLossWarning && (
        <div className="bg-error-2 border border-error-1/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-error-1 mt-0.5 flex-shrink-0" />
          <div className="text-xs font-medium text-error-1 space-y-1">
            <p className="text-sm font-bold">Warning: selling at a loss</p>
            <p>
              Your deepest tier sells at {formatToNaira(deepestUnitPrice)} per
              unit, below the cost price of {formatToNaira(costPrice)}.
            </p>
          </div>
        </div>
      )}

      <Button
        type="button"
        className="w-full h-[48px]"
        disabled={saving || clearingLegacy || !!error || isError}
        onClick={handleSave}
      >
        {saving || clearingLegacy ? <Spinner /> : "Save"}
      </Button>
    </div>
  );
};

const SetDiscountModal = ({
  productId,
  product,
  closeModal,
}: {
  productId: any;
  closeModal: any;
  product: any;
}) =>
  product?.variations?.length ? (
    <VariationDiscountsForm product={product} closeModal={closeModal} />
  ) : (
    <SingleProductDiscountForm
      productId={productId}
      product={product}
      closeModal={closeModal}
    />
  );

export default SetDiscountModal;
