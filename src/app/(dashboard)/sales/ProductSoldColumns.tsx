import { ColumnDef } from "@tanstack/react-table";

import { CustomModal } from "@/components/app/CustomModal";
import { formatToNaira } from "@/utils/formatMoney";
import { Undo2 } from "lucide-react";
import { useState } from "react";
import ReverseSale from "./ReverseSale";
import { SalesDataItem } from "./types";

export const columns: ColumnDef<SalesDataItem>[] = [
  //   {
  //     accessorKey: "logo",
  //     header: "",
  //     cell: ({ row }) => {
  //       const customer = row.original;
  //       return (
  //         <div className="relative h-10 w-10 rounded-md overflow-hidden">
  //           <Image
  //             src={customer.profile_pic}
  //             alt={`${customer.name} logo`}
  //             fill
  //             className="object-cover"
  //           />
  //         </div>
  //       );
  //     },
  //   },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{product.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "unit_sold",
    header: "Unit Sold",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{product.unit_sold}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">
            {formatToNaira(product.revenue)}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{product.profit}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">-</p>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const product = row.original;
      const [openReverseModal, setOpenReverseModal] = useState(false);
      const closeReverseModal = () => setOpenReverseModal(false);

      return (
        <>
          <div
            onClick={() => setOpenReverseModal(true)}
            className="bg-yellow-50 rounded-lg w-[130px] gap-2 p-2 px-2 flex items-center justify-center border border-yellow-100  cursor-pointer"
          >
            <Undo2 /> Reverse Sale
          </div>
          <CustomModal
            isOpen={openReverseModal}
            onClose={closeReverseModal}
            trigger={false}
            title="Reverse Sale"
          >
            <ReverseSale
              product={product}
              closeReverseModal={closeReverseModal}
            />
          </CustomModal>
        </>
      );
    },
  },
];
