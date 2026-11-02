"use client";

import { useUpdateBusinessMutation } from "@/api/business/create-business";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { Switch } from "@/components/ui/switch";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { allowsSalesWithoutStock } from "@/utils/stock";
import { PackageX, TriangleAlert } from "lucide-react";

/**
 * business.allow_sales_without_stock. Off (default): sales can't exceed stock.
 * On: POS and storefront keep selling at zero and stock goes negative, which
 * the next restock offsets. Reads the saved value, so it always shows what the
 * backend holds.
 */
const SellWithoutStockCard = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data: BusinessData } = useFetchBusinessById(business_id);
  const active = allowsSalesWithoutStock(BusinessData?.data);

  // The mutation toasts success/failure and refetches the business.
  const { mutate: updateBusiness, isPending } = useUpdateBusinessMutation();

  const handleToggle = (checked: boolean) => {
    if (!business_id) return;
    const formData = new FormData();
    formData.append("business_id", business_id);
    formData.append("allow_sales_without_stock", String(checked));
    updateBusiness(formData);
  };

  return (
    <div className="rounded-xl border border-grey-5 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-6">
          <PackageX className="h-5 w-5 text-primary-green-300" />
        </div>
        <Switch
          checked={active}
          onCheckedChange={handleToggle}
          disabled={isPending || !business_id}
          aria-label="Allow sales without stock"
        />
      </div>

      <div className="mb-1 flex items-center gap-2">
        <h5 className="text-sm font-bold text-grey-1">Sell without stock</h5>
        {active && (
          <span className="rounded-full bg-success-2 px-2 py-0.5 text-[10px] font-bold text-success-1">
            On
          </span>
        )}
      </div>

      <p className="text-xs text-grey-3">
        Keep selling items at the till and online even when stock runs out.
        Stock goes below zero (e.g. −20) and is balanced out by your next
        restock.
      </p>

      {active && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning-1/30 bg-warning-2 p-2.5">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-1" />
          <p className="text-[11px] text-grey-2">
            Out-of-stock items show as &quot;Available on order&quot; on your
            storefront. Remember to restock oversold items.
          </p>
        </div>
      )}
    </div>
  );
};

export default SellWithoutStockCard;
