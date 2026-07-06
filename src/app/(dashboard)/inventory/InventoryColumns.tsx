import { CustomModal } from "@/components/app/CustomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { getFirstProductImage } from "@/utils/productMedia";
import { ColumnDef } from "@tanstack/react-table";
import { EyeOff, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import RestockItem from "./[id]/restock/RestockItem";
import AddWaste from "./AddWaste";
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
  "IN-STOCK": "bg-success-2 text-success-1",
  LOW: "bg-warning-2 text-warning-1",
  "OUT-OF-STOCK": "bg-error-2 text-error-1",
  DEFAULT: "bg-grey-6 text-grey-2",
};

// Deterministic pastel palette for products without a real thumbnail —
// matches the initials-avatar convention used for order/delivery partners.
const AVATAR_PALETTE = [
  "#fde68a",
  "#fca5a5",
  "#86efac",
  "#6ee7b7",
  "#93c5fd",
  "#c4b5fd",
  "#fdba74",
  "#a5f3fc",
  "#fecdd3",
  "#d9f99d",
];

const hashSeed = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
};

const getAvatarColor = (id: string) =>
  AVATAR_PALETTE[hashSeed(id || "fallback") % AVATAR_PALETTE.length];

export const columns = (role: any, can: any): ColumnDef<InventoryItem>[] => {
  console.log("User role in columns:", role);
  console.log("User permissions in columns:", can);
  const baseColumns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const inventory = row.original as any;
        const thumb = getFirstProductImage(inventory);
        const initials = (inventory.name || "??").slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
              {thumb ? (
                <Image
                  src={thumb}
                  alt={`${inventory.name} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xs font-extrabold text-grey-1"
                  style={{ backgroundColor: getAvatarColor(inventory.id) }}
                >
                  {initials}
                </div>
              )}
            </div>
            <div className="font-bold text-grey-1 flex items-center gap-1.5">
              {inventory.name}
              {inventory?.variations?.length > 0 && (
                <span className="ml-2 text-xs font-medium text-grey-4">
                  ({inventory?.variations.length} variants)
                </span>
              )}
              {inventory?.watchlist && (
                <EyeOff className="w-3.5 h-3.5 text-error-1 flex-shrink-0" />
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
            className={cn("font-bold text-grey-1", {
              "text-error-1": isOutOfStock,
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
          <div className="font-medium text-grey-3">
            {inventory.department ?? "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "sku",
      header: "Sku",
      cell: ({ row }) => {
        const inventory = row.original;
        return (
          <div className="font-medium text-grey-3">{inventory.sku ?? "-"}</div>
        );
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
              "px-2 py-1 rounded-full text-xs font-extrabold uppercase",
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
            return (
              <div className="font-bold text-grey-1">
                {formatToNaira(minPrice)}
              </div>
            );
          }

          return (
            <div className="font-bold text-grey-1">
              {formatToNaira(minPrice)} - {formatToNaira(maxPrice)}
              <div className="text-xs font-medium text-grey-4">
                {inventory.variations.length} variants
              </div>
            </div>
          );
        }

        return (
          <div className="font-bold text-grey-1">
            {formatToNaira(inventory.selling_price || inventory.amount || 0)}
          </div>
        );
      },
    },
  ];

  if (role !== "ACCOUNTANT") {
    baseColumns.push({
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
        const [openWasteModal, setOpenWasteModal] = useState(false);

        const handleOpenRestockModal = () => setOpenRestockModal(true);
        const handleOpenWasteModal = () => setOpenWasteModal(true);

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
        const openDeleteProductModalFunc = () =>
          setOpenDeleteProductModal(true);

        const [openReturnedProductModal, setOpenReturnedProductModal] =
          useState(false);
        const closeReturnedProductModal = () =>
          setOpenReturnedProductModal(false);
        const openReturnedProductModalFunc = () =>
          setOpenReturnedProductModal(true);

        const [openDamagedProductModal, setOpenDamagedProductModal] =
          useState(false);
        const [openMoveProdModal, setOpenMoveProdModal] = useState(false);
        const closeDamagedProductModal = () =>
          setOpenDamagedProductModal(false);
        const openDamagedProductModalFunc = () =>
          setOpenDamagedProductModal(true);
        const openMoveProdModalFunc = () => setOpenMoveProdModal(true);

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 p-0 hover:bg-grey-6 text-grey-3 rounded-full flex items-center justify-center cursor-pointer">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white border border-grey-5 shadow-lg min-w-[180px]"
              >
                <DropdownMenuItem
                  onClick={openEditPriceModalFunc}
                  className="cursor-pointer px-4 py-2 capitalize hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                >
                  Edit {` ${inventory.type?.toLocaleLowerCase()} `} price
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={openViewDetailsFunc}
                  className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                >
                  <span>View more details</span>
                </DropdownMenuItem>
                {isProduct && (
                  <DropdownMenuItem
                    onClick={handleOpenSetDiscountModal}
                    className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                  >
                    Set Discount
                  </DropdownMenuItem>
                )}
                {isProduct && (
                  <DropdownMenuItem
                    onClick={handleOpenWasteModal}
                    className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                  >
                    Add Waste/Left Over
                  </DropdownMenuItem>
                )}
                {isProduct && can("return_items") && (
                  <DropdownMenuItem
                    onClick={openReturnedProductModalFunc}
                    className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                  >
                    Add Returned Product
                  </DropdownMenuItem>
                )}
                {isProduct && can("damage_items") && (
                  <DropdownMenuItem
                    onClick={openDamagedProductModalFunc}
                    className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                  >
                    Add Damaged Product
                  </DropdownMenuItem>
                )}
                {isProduct &&
                  can("move_items_to_production") &&
                  inventory?.raw_material && (
                    <DropdownMenuItem
                      onClick={openMoveProdModalFunc}
                      className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                    >
                      Move to production
                    </DropdownMenuItem>
                  )}

                {can("restock_products") && (
                  <DropdownMenuItem
                    onClick={handleOpenRestockModal}
                    className={cn(
                      "cursor-pointer px-4 py-2 transition-colors",
                      isProduct
                        ? "hover:bg-secondary-6 hover:text-primary-green-300"
                        : "text-error-1 opacity-50 cursor-not-allowed",
                    )}
                    disabled={!isProduct}
                  >
                    {isProduct ? "Quick restock" : "Cannot restock"}
                  </DropdownMenuItem>
                )}

                {can("transfer_items") && (
                  <DropdownMenuItem
                    onClick={() => setTransferProductModal(true)}
                    className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                  >
                    Transfer Product
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => setOpenDeleteProductModal(true)}
                  className="cursor-pointer text-error-1 px-4 py-2 hover:bg-error-2 hover:text-error-1 transition-colors"
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
              isOpen={openWasteModal}
              onClose={() => setOpenWasteModal(false)}
              trigger={false}
              title="Add Waste"
            >
              <AddWaste
                productId={inventory.id}
                closeModal={() => setOpenWasteModal(false)}
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
    });
  }

  return baseColumns;
};
