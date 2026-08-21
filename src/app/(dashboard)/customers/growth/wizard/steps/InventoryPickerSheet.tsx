"use client";

import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { useFormatMoney } from "@/utils/formatMoney";
import { Check, Package, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface PickedInventoryItem {
  id: string;
  name: string;
}

/**
 * Side panel for choosing the product or service a programme gives away.
 *
 * Deliberately the same shape as the Create Order / Create Combo pickers: a
 * right-hand sheet, searchable and paged off the same inventory endpoint. A
 * dropdown would not do — a merchant with hundreds of lines needs to search,
 * and the sheet leaves the wizard visible behind it.
 */
const InventoryPickerSheet = ({
  open,
  onClose,
  onSelect,
  type,
  selectedId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: PickedInventoryItem) => void;
  /** PRODUCT reads stock and price; SERVICE has no stock to show. */
  type: "PRODUCT" | "SERVICE";
  selectedId?: string;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetInventoryQuery({
    params: {
      id: business_id || "",
      type,
      search,
      page,
      limit: 20,
      // Raw materials cannot be handed to a customer as a reward.
      ...(type === "PRODUCT" ? { include_raw_material: "false" } : {}),
    },
    // Nothing is fetched until the sheet is actually opened.
    enabled: Boolean(business_id) && open,
  });

  const items: any[] = data?.data?.results?.data || [];
  const totalPages = data?.data?.pages || 1;

  const noun = type === "PRODUCT" ? "product" : "service";

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-grey-5 px-4 py-3.5">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-grey-1">
              Choose a {noun}
            </h3>
            <p className="mt-0.5 text-[11px] text-grey-3">
              This is what customers receive when they complete the streak.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-grey-3 hover:bg-grey-6 hover:text-grey-1 cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0 border-b border-grey-5 px-4 py-3">
          <SearchInput
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              // A new search invalidates whatever page we were on.
              setPage(1);
            }}
            placeholder={`Search ${noun}s`}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-primary-green-300" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-grey-3">
              {search
                ? `No ${noun}s match that search.`
                : `No ${noun}s in your inventory yet.`}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const id = String(item.id);
                const picked = id === selectedId;
                const image = item.image_url || item.image || null;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect({ id, name: item.name })}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                      picked
                        ? "border-primary-green-300 bg-primary-green-500"
                        : "border-grey-5 bg-white hover:border-primary-green-300/50",
                    )}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-grey-6 text-grey-4">
                        <Package className="h-4 w-4" />
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-grey-1">
                        {item.name}
                      </span>
                      <span className="block truncate text-[11px] text-grey-3">
                        {formatMoney(Number(item.selling_price ?? 0))}
                        {type === "PRODUCT" && item.stock !== undefined
                          ? ` · ${Number(item.stock)} in stock`
                          : ""}
                      </span>
                    </span>

                    {picked && (
                      <Check className="h-4 w-4 shrink-0 text-primary-green-300" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-grey-5 px-4 py-3">
            <Button
              variant="outline"
              className="h-9 rounded-xl text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-[11px] text-grey-3">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              className="h-9 rounded-xl text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InventoryPickerSheet;
