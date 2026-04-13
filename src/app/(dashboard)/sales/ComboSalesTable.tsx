"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ComboSaleItem {
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

interface ComboSale {
  id: string;
  combo_name: string;
  combo_image: string | null;
  quantity: number;
  selling_price: number;
  items: ComboSaleItem[];
  sold_at: string;
}

// Dummy data
const DUMMY_COMBO_SALES: ComboSale[] = [
  {
    id: "1",
    combo_name: "Big Combo",
    combo_image: null,
    quantity: 3,
    selling_price: 3500,
    items: [
      {
        product_name: "Jollof Rice",
        product_image: null,
        quantity: 2,
        price: 500,
      },
      {
        product_name: "Fried Rice",
        product_image: null,
        quantity: 2,
        price: 500,
      },
      {
        product_name: "Chicken",
        product_image: null,
        quantity: 2,
        price: 2000,
      },
    ],
    sold_at: "2026-04-13T10:30:00Z",
  },
  {
    id: "2",
    combo_name: "Family Pack",
    combo_image: null,
    quantity: 1,
    selling_price: 5000,
    items: [
      {
        product_name: "Jollof Rice",
        product_image: null,
        quantity: 4,
        price: 500,
      },
      {
        product_name: "Chicken",
        product_image: null,
        quantity: 4,
        price: 2000,
      },
      {
        product_name: "Chapman",
        product_image: null,
        quantity: 4,
        price: 800,
      },
    ],
    sold_at: "2026-04-12T14:15:00Z",
  },
  {
    id: "3",
    combo_name: "Lunch Special",
    combo_image: null,
    quantity: 5,
    selling_price: 1800,
    items: [
      {
        product_name: "Fried Rice",
        product_image: null,
        quantity: 1,
        price: 500,
      },
      {
        product_name: "Plantain",
        product_image: null,
        quantity: 2,
        price: 400,
      },
      {
        product_name: "Pepsi 50cl",
        product_image: null,
        quantity: 1,
        price: 300,
      },
    ],
    sold_at: "2026-04-11T09:00:00Z",
  },
];

const ComboDetailsModal = ({
  combo,
  onClose,
}: {
  combo: ComboSale;
  onClose: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          {combo.combo_image ? (
            <Image
              src={combo.combo_image}
              alt={combo.combo_name}
              width={40}
              height={40}
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <Package className="h-4 w-4 text-slate-400" />
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{combo.combo_name}</p>
          <p className="text-xs text-slate-500">
            Qty sold: {combo.quantity} · Total:{" "}
            {formatToNaira(combo.selling_price * combo.quantity)}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">
          Products in this combo
        </h4>
        <div className="space-y-2">
          {combo.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {item.product_image ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full rounded-md"
                    />
                  ) : (
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatToNaira(item.price)} x {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {formatToNaira(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <span className="text-sm font-medium text-slate-600">
          Combo Selling Price
        </span>
        <span className="text-base font-bold text-green-700">
          {formatToNaira(combo.selling_price)}
        </span>
      </div>
    </div>
  );
};

const ComboSaleActions = ({ combo }: { combo: ComboSale }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDetails(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>

      <CustomModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        trigger={false}
        title="Combo Sale Details"
      >
        <ComboDetailsModal
          combo={combo}
          onClose={() => setShowDetails(false)}
        />
      </CustomModal>
    </>
  );
};

const comboSalesColumns: ColumnDef<ComboSale>[] = [
  {
    accessorKey: "combo_name",
    header: "Combo",
    cell: ({ row }) => {
      const combo = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
            {combo.combo_image ? (
              <Image
                src={combo.combo_image}
                alt={combo.combo_name}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <Package className="h-4 w-4 text-slate-400" />
            )}
          </div>
          <span className="font-medium text-slate-900">
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
      <span className="text-sm font-medium text-slate-700">
        {row.original.quantity}
      </span>
    ),
  },
  {
    accessorKey: "selling_price",
    header: "Price",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-green-700">
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

const ComboSalesTable = () => {
  return (
    <div className="w-full">
      <CustomTable
        columns={comboSalesColumns}
        data={DUMMY_COMBO_SALES}
        loading={false}
        noDataText={
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No combo sales yet
            </h3>
            <p className="text-slate-500 text-sm">
              Combo sales will appear here once products are sold
            </p>
          </div>
        }
      />
    </div>
  );
};

export default ComboSalesTable;
