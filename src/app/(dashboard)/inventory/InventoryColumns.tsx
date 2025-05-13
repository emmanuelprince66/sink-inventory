import { CustomModal } from "@/components/app/CustomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import RestockItem from "./[id]/restock/RestockItem";
import EditProductPrice from "./EditProductPrice";
import { InventoryItem } from "./type";
import ViewDetails from "./ViewDetails";

const statusColors = {
  "IN-STOCK": "bg-green-100 text-green-800",
  LOW: "bg-yellow-100 text-yellow-800",
  "OUT-OF-STOCK": "bg-red-100 text-red-800",
  DEFAULT: "bg-gray-100 text-gray-800",
};

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "logo",
    header: "",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="relative h-10 w-10 rounded-md overflow-hidden">
          <Image
            src={inventory.image}
            alt={`${inventory.name} logo`}
            fill
            className="object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const inventory = row.original;
      return <div className="font-medium">{inventory.name}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const inventory = row.original;
      const isOutOfStock =
        inventory.quantity === 0 || inventory.quantity === null;

      return (
        <div
          className={cn("font-medium", {
            "text-red-500": isOutOfStock,
          })}
        >
          {isOutOfStock ? "0 (Out of stock)" : inventory.quantity}
        </div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "Sku",
    cell: ({ row }) => {
      const inventory = row.original;
      // const isOutOfStock =
      //   inventory.quantity === 0 || inventory.quantity === null;

      return <div className="font-medium">{inventory.sku ?? "-"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const inventory = row.original;
      const statusClass =
        statusColors[inventory.status as keyof typeof statusColors] ||
        statusColors.DEFAULT;

      return (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusClass
          )}
        >
          {inventory.status}
        </span>
      );
    },
  },
  {
    accessorKey: "selling_price",
    header: "Selling Price",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="font-medium">
          {formatToNaira(inventory.selling_price)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const inventory = row.original;
      const canRestock = inventory.sold > 0;
      const [openEditPriceModal, setOpenEditPriceModal] = useState(false);

      const [openViewDetails, setOpenViewDetails] = useState(false);
      const [openRestockModal, setOpenRestockModal] = useState(false);

      const handleOpenRestockModal = () => setOpenRestockModal(true);

      const openViewDetailsFunc = (e: React.MouseEvent) => {
        setOpenViewDetails(true);
      };

      const openEditPriceModalFunc = (e: React.MouseEvent) => {
        setOpenEditPriceModal(true);
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border border-gray-200 shadow-lg min-w-[180px]"
            >
              <DropdownMenuItem
                onClick={openEditPriceModalFunc}
                className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                Edit Product Price
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={openViewDetailsFunc}
                className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                <span className="">View more details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleOpenRestockModal}
                className={cn(
                  "cursor-pointer px-4 py-2 transition-colors",
                  canRestock
                    ? "hover:bg-green-50 hover:text-green-600"
                    : "text-red-500 opacity-50 cursor-not-allowed"
                )}
                disabled={!canRestock}
              >
                {canRestock ? "Quick restock" : "Cannot restock"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CustomModal
            isOpen={openEditPriceModal}
            onClose={() => setOpenEditPriceModal(false)}
            trigger={false}
            title="Edit product price"
          >
            <EditProductPrice id={inventory.id} />
          </CustomModal>
          {/*  */}

          <CustomModal
            isOpen={openViewDetails}
            onClose={() => setOpenViewDetails(false)}
            trigger={false}
            title="View Details"
          >
            <ViewDetails data={inventory} />
          </CustomModal>

          {/* restock */}
          <CustomModal
            isOpen={openRestockModal}
            onClose={() => setOpenRestockModal(false)}
            trigger={false}
            title="Restock Product"
          >
            <RestockItem data={inventory} />
          </CustomModal>
        </>
      );
    },
  },
];
