"use client";

import {
  useFetchComboSaleDetailQuery,
  useFetchComboSalesQuery,
  type ComboSale,
} from "@/api/sales/fetch-combo-sales";
import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { Spinner } from "@/components/app/Spinner";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DateRange } from "react-day-picker";

const comboSalesColumns: ColumnDef<ComboSale>[] = [
  {
    accessorKey: "combo_name",
    header: "Combo",
    cell: ({ row }) => {
      const combo = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-grey-6 flex items-center justify-center shrink-0 overflow-hidden">
            {combo.combo_image ? (
              <Image
                src={combo.combo_image}
                alt={combo.combo_name}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <Package className="h-4 w-4 text-grey-4" />
            )}
          </div>
          <span className="font-bold text-primary-green-300">
            {combo.combo_name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty Sold",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-primary-green-300">
        {row.original.quantity}
      </span>
    ),
  },
  {
    accessorKey: "selling_price",
    header: "Price",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-primary-green-300">
        {formatToNaira(row.original.selling_price)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ComboSaleActions combo={row.original} />,
  },
];

const ComboSaleActions = ({ combo }: { combo: ComboSale }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDetails(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-green-300 bg-secondary-6 rounded-lg hover:bg-secondary-5 transition-colors cursor-pointer"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>

      {/* Mounted only while open, so opening a row is what triggers its
          detail request rather than every row firing one on page load. */}
      {showDetails && (
        <CustomModal
          isOpen
          onClose={() => setShowDetails(false)}
          trigger={false}
          title="Combo Sale Details"
        >
          <ComboDetailsModal combo={combo} />
        </CustomModal>
      )}
    </>
  );
};

const ComboDetailsModal = ({ combo }: { combo: ComboSale }) => {
  // The summary row may or may not carry the product breakdown; the detail
  // endpoint is the one that definitely does. Fetch it, but render the row
  // meanwhile so the modal is never empty.
  const { data: detail, isLoading } = useFetchComboSaleDetailQuery({
    comboId: combo.id,
  });

  const shown = detail ?? combo;
  const items = shown.items.length ? shown.items : combo.items;

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-grey-6">
        <div className="w-10 h-10 rounded-lg bg-grey-6 flex items-center justify-center shrink-0">
          {shown.combo_image ? (
            <Image
              src={shown.combo_image}
              alt={shown.combo_name}
              width={40}
              height={40}
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <Package className="h-4 w-4 text-grey-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-grey-1">{shown.combo_name}</p>
          <p className="text-xs font-medium text-grey-4">
            Qty sold: {shown.quantity} · Total:{" "}
            {formatToNaira(shown.selling_price * shown.quantity)}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-grey-2 mb-2">
          Products in this combo
        </h4>

        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-lg bg-grey-6 px-3 py-6 text-center text-xs font-medium text-grey-4">
            No product breakdown returned for this combo.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-grey-6 border border-grey-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white border border-grey-5 flex items-center justify-center shrink-0">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full rounded-md"
                      />
                    ) : (
                      <Package className="h-3.5 w-3.5 text-grey-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-grey-1">
                      {item.product_name}
                    </p>
                    <p className="text-xs font-medium text-grey-4">
                      {formatToNaira(item.price)} x {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-bold text-grey-1">
                  {formatToNaira(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center gap-3 pt-3 border-t border-grey-6">
        <span className="text-sm font-bold text-grey-2">
          Combo Selling Price
        </span>
        <span className="shrink-0 text-base font-extrabold text-primary-green-300">
          {formatToNaira(shown.selling_price)}
        </span>
      </div>
    </div>
  );
};

const toApiDate = (date?: Date) =>
  date ? date.toISOString().slice(0, 10) : undefined;

const ComboSalesTable = ({ dateRange }: { dateRange?: DateRange }) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: combos, isLoading } = useFetchComboSalesQuery({
    params: {
      businessId: business_id ?? "",
      start_date: toApiDate(dateRange?.from),
      end_date: toApiDate(dateRange?.to),
    },
  });

  return (
    <div className="w-full min-w-0">
      <CustomTable
        columns={comboSalesColumns}
        data={combos ?? []}
        loading={isLoading}
        bordered={false}
        noDataText={
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-grey-6 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-grey-4" />
            </div>
            <h3 className="text-lg font-extrabold text-grey-1 mb-1">
              No combo sales yet
            </h3>
            <p className="text-grey-4 text-sm font-medium">
              Combo sales will appear here once products are sold
            </p>
          </div>
        }
      />
    </div>
  );
};

export default ComboSalesTable;
