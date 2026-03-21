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
import { EyeOff, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import RestockItem from "./[id]/restock/RestockItem";
import DamagedProduct from "./DamagedProduct";
import DeleteItem from "./DeleteItem";
import EditProductPrice from "./EditProductPrice";
import MoveProduction from "./MoveProduction";
import ReturnProduct from "./ReturnProduct";
import SetDiscountModal from "./SetDiscountModal";
import TransferProduct from "./TransferProduct";
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
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const inventory = row.original as any;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image
              src={inventory.image}
              alt={`${inventory.name} logo`}
              fill
              className="object-cover"
            />
          </div>
          <div className="font-medium flex items-center gap-1.5">
            {inventory.name}
            {inventory?.variations?.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({inventory?.variations.length} variants)
              </span>
            )}
            {inventory?.watchlist && (
              <EyeOff
                className="w-3.5 h-3.5 text-red-500 flex-shrink-0"
                // title="On watchlist"
              />
            )}
          </div>
        </div>
      );
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
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className={cn("font-medium")}>{inventory.department ?? "-"}</div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "Sku",
    cell: ({ row }) => {
      const inventory = row.original;
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
            statusClass,
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
      const inventory = row.original as any;

      if (inventory.variations && inventory.variations.length > 0) {
        const prices = inventory.variations.map((v: any) => v.selling_price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          return <div className="font-medium">{formatToNaira(minPrice)}</div>;
        }

        return (
          <div className="font-medium">
            {formatToNaira(minPrice)} - {formatToNaira(maxPrice)}
            <div className="text-xs text-gray-500">
              {inventory.variations.length} variants
            </div>
          </div>
        );
      }

      return (
        <div className="font-medium">
          {formatToNaira(inventory.selling_price || inventory.amount || 0)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const inventory = row.original;
      const isProduct = inventory.type === "PRODUCT";
      const [openEditPriceModal, setOpenEditPriceModal] = useState(false);
      const [addDiscountModal, setAddDiscountModal] = useState(false);

      const handleOpenSetDiscountModal = () => setAddDiscountModal(true);
      const closeSetDiscountModal = () => setAddDiscountModal(false);

      const [openViewDetails, setOpenViewDetails] = useState(false);
      const [openRestockModal, setOpenRestockModal] = useState(false);

      const handleOpenRestockModal = () => setOpenRestockModal(true);

      const openViewDetailsFunc = (e: React.MouseEvent) => {
        setOpenViewDetails(true);
      };

      const openEditPriceModalFunc = (e: React.MouseEvent) => {
        setOpenEditPriceModal(true);
      };

      const [transferProductModal, setTransferProductModal] = useState(false);
      const closeTransferProductModal = () => setTransferProductModal(false);

      const [openDeleteProductModal, setOpenDeleteProductModal] =
        useState(false);
      const closeDeleteProductModal = () => setOpenDeleteProductModal(false);
      const openDeleteProductModalFunc = () => setOpenDeleteProductModal(true);

      const [openReturnedProductModal, setOpenReturnedProductModal] =
        useState(false);
      const closeReturnedProductModal = () =>
        setOpenReturnedProductModal(false);
      const openReturnedProductModalFunc = () =>
        setOpenReturnedProductModal(true);

      const [openDamagedProductModal, setOpenDamagedProductModal] =
        useState(false);
      const [openMoveProdModal, setOpenMoveProdModal] = useState(false);
      const closeDamagedProductModal = () => setOpenDamagedProductModal(false);
      const openDamagedProductModalFunc = () =>
        setOpenDamagedProductModal(true);
      const openMoveProdModalFunc = () => setOpenMoveProdModal(true);

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
                className="cursor-pointer px-4 py-2 capitalize hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                Edit {` ${inventory.type?.toLocaleLowerCase()} `} price
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={openViewDetailsFunc}
                className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                <span>View more details</span>
              </DropdownMenuItem>
              {isProduct && (
                <DropdownMenuItem
                  onClick={handleOpenSetDiscountModal}
                  className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  Set Discount
                </DropdownMenuItem>
              )}
              {isProduct && (
                <DropdownMenuItem
                  onClick={openReturnedProductModalFunc}
                  className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  Add Returned Product
                </DropdownMenuItem>
              )}
              {isProduct && (
                <DropdownMenuItem
                  onClick={openDamagedProductModalFunc}
                  className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  Add Damaged Product
                </DropdownMenuItem>
              )}
              {isProduct && (
                <DropdownMenuItem
                  onClick={openMoveProdModalFunc}
                  className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  Move to production
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleOpenRestockModal}
                className={cn(
                  "cursor-pointer px-4 py-2 transition-colors",
                  isProduct
                    ? "hover:bg-green-50 hover:text-green-600"
                    : "text-red-500 opacity-50 cursor-not-allowed",
                )}
                disabled={!isProduct}
              >
                {isProduct ? "Quick restock" : "Cannot restock"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTransferProductModal(true)}
                className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                Transfer Product
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenDeleteProductModal(true)}
                className="cursor-pointer text-red-500 px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CustomModal
            isOpen={openDeleteProductModal}
            onClose={closeDeleteProductModal}
            trigger={false}
            title={`Delete ${inventory.type.toLocaleLowerCase()}`}
          >
            <DeleteItem
              closeModal={closeDeleteProductModal}
              id={inventory.id}
              type={inventory.type}
              text={`Are you sure you want to delete this ${inventory.type}?`}
            />
          </CustomModal>

          <CustomModal
            isOpen={openEditPriceModal}
            onClose={() => setOpenEditPriceModal(false)}
            trigger={false}
            title={`Edit ${inventory.type.toLocaleLowerCase()} price`}
          >
            <EditProductPrice
              productId={inventory.id}
              product={inventory}
              type={inventory.type}
              closeModal={() => setOpenEditPriceModal(false)}
            />
          </CustomModal>

          <CustomModal
            isOpen={openViewDetails}
            onClose={() => setOpenViewDetails(false)}
            trigger={false}
            title="View Details"
          >
            <ViewDetails
              closeModal={() => setOpenViewDetails(false)}
              data={inventory}
            />
          </CustomModal>

          <CustomModal
            isOpen={addDiscountModal}
            onClose={closeSetDiscountModal}
            trigger={false}
            title="Set Discount"
          >
            <SetDiscountModal
              productId={inventory.id}
              product={inventory}
              closeModal={closeSetDiscountModal}
            />
          </CustomModal>

          <CustomModal
            isOpen={openRestockModal}
            onClose={() => setOpenRestockModal(false)}
            trigger={false}
            title="Restock Product"
          >
            <RestockItem
              closeModal={() => setOpenRestockModal(false)}
              data={inventory}
            />
          </CustomModal>
          <CustomModal
            isOpen={openMoveProdModal}
            onClose={() => setOpenMoveProdModal(false)}
            trigger={false}
            title="Move to Production"
          >
            <MoveProduction
              productId={inventory.id}
              closeModal={() => setOpenMoveProdModal(false)}
            />
          </CustomModal>

          <CustomModal
            isOpen={transferProductModal}
            onClose={closeTransferProductModal}
            trigger={false}
            title="Transfer Product"
          >
            <TransferProduct
              closeModal={closeTransferProductModal}
              inventory={inventory}
            />
          </CustomModal>

          <CustomModal
            isOpen={openReturnedProductModal}
            onClose={closeReturnedProductModal}
            trigger={false}
            title="Add Returned Product"
          >
            <ReturnProduct
              productId={inventory.id}
              closeModal={closeReturnedProductModal}
            />
          </CustomModal>

          <CustomModal
            isOpen={openDamagedProductModal}
            onClose={closeDamagedProductModal}
            trigger={false}
            title="Add Damaged Product"
          >
            <DamagedProduct
              productId={inventory.id}
              closeModal={closeDamagedProductModal}
            />
          </CustomModal>
        </>
      );
    },
  },
];
