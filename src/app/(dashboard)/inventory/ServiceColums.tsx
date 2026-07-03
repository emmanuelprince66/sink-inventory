import { CustomModal } from "@/components/app/CustomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteItem from "./DeleteItem";
import EditProductPrice from "./EditProductPrice";
import EditService from "./EditService";
import { InventoryItem } from "./type";

const statusColors = {
  "IN-STOCK": "bg-success-2 text-success-1",
  LOW: "bg-warning-2 text-warning-1",
  "OUT-OF-STOCK": "bg-error-2 text-error-1",
  DEFAULT: "bg-grey-6 text-grey-2",
};

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: "Service Name",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden">
            <Image
              src={inventory.image}
              alt={`${inventory.name} logo`}
              fill
              className="object-cover"
            />
          </div>
          <div className="font-medium">{inventory.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const inventory = row.original;

      return <div>{inventory?.category}</div>;
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const inventory = row.original;

      return <span>{inventory.description}</span>;
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
      const router = useRouter();

      const handleOpenSetDiscountModal = () => setAddDiscountModal(true);
      const closeSetDiscountModal = () => setAddDiscountModal(false);

      const [openEditServiceModal, setOpenEditServiceModal] = useState(false);
      const [openDeleteServiceModal, setOpenDeleteServiceModal] =
        useState(false);
      const closeDeleteServiceModal = () => setOpenDeleteServiceModal(false);

      const [openRestockModal, setOpenRestockModal] = useState(false);

      const handleOpenRestockModal = () => setOpenRestockModal(true);

      const openEditPriceModalFunc = (e: React.MouseEvent) => {
        setOpenEditPriceModal(true);
      };

      const [transferProductModal, setTransferProductModal] = useState(false);
      const closeTransferProductModal = () => setTransferProductModal(false);

      const [openReturnedProductModal, setOpenReturnedProductModal] =
        useState(false);
      const closeReturnedProductModal = () =>
        setOpenReturnedProductModal(false);
      const openReturnedProductModalFunc = () =>
        setOpenReturnedProductModal(true);
      const [openDamagedProductModal, setOpenDamagedProductModal] =
        useState(false);
      const closeDamagedProductModal = () => setOpenDamagedProductModal(false);
      const openDamagedProductModalFunc = () =>
        setOpenDamagedProductModal(true);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 p-0 hover:bg-grey-6 rounded-full flex items-center justify-center cursor-pointer">
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
                className="cursor-pointer px-4 py-2 capitalize hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
              >
                Edit {` ${inventory.type?.toLocaleLowerCase()} `} price
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setOpenEditServiceModal(true)}
                className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
              >
                Edit Service
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setOpenDeleteServiceModal(true)}
                className="cursor-pointer px-4 py-2 text-error-1 hover:bg-error-2 hover:text-error-1 transition-colors"
              >
                Delete Service
              </DropdownMenuItem>
              {/* {isProduct && (
                <DropdownMenuItem
                  onClick={handleOpenSetDiscountModal}
                  className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
                >
                  Set Discount
                </DropdownMenuItem>
              )}
              {isProduct && (
                <DropdownMenuItem
                  onClick={openReturnedProductModalFunc}
                  className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
                >
                  Add Returned Product
                </DropdownMenuItem>
              )}
              {isProduct && (
                <DropdownMenuItem
                  onClick={openDamagedProductModalFunc}
                  className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
                >
                  Add Damaged Product
                </DropdownMenuItem>
              )} */}
              {/* <DropdownMenuItem
                onClick={openViewDetailsFunc}
                className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
              >
                <span className="">View more details</span>
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                onClick={handleOpenRestockModal}
                className={cn(
                  "cursor-pointer px-4 py-2 transition-colors",
                  isProduct
                    ? "hover:bg-primary-green-300/10 hover:text-primary-green-300"
                    : "text-error-1 opacity-50 cursor-not-allowed"
                )}
                disabled={!isProduct}
              >
                {isProduct ? "Quick restock" : "Cannot restock"}
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                onClick={() => setTransferProductModal(true)}
                className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
              >
                Transfer Product
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
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
            isOpen={openEditServiceModal}
            onClose={() => setOpenEditServiceModal(false)}
            trigger={false}
            title={`Edit ${inventory.type.toLocaleLowerCase()} `}
          >
            <EditService
              serviceId={inventory.id}
              service={inventory}
              type={inventory.type}
              closeModal={() => setOpenEditServiceModal(false)}
            />
          </CustomModal>
          <CustomModal
            isOpen={openDeleteServiceModal}
            onClose={() => setOpenDeleteServiceModal(false)}
            trigger={false}
            title={`Delete ${inventory.type.toLocaleLowerCase()} `}
          >
            <DeleteItem
              id={inventory.id}
              text={`Are you sure you want to delete this ${inventory.type.toLocaleLowerCase()}?`}
              type={inventory.type}
              closeModal={() => setOpenDeleteServiceModal(false)}
            />
          </CustomModal>
          {/*  */}

          {/* <CustomModal
            isOpen={openViewDetails}
            onClose={() => setOpenViewDetails(false)}
            trigger={false}
            title="View Details"
          >
            <ViewDetails
              closeModal={() => setOpenViewDetails(false)}
              data={inventory}
            />
          </CustomModal> */}
          {/* <CustomModal
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
          </CustomModal> */}

          {/* restock */}
          {/* <CustomModal
            isOpen={openRestockModal}
            onClose={() => setOpenRestockModal(false)}
            trigger={false}
            title="Restock Product"
          >
            <RestockItem
              closeModal={() => setOpenRestockModal(false)}
              data={inventory}
            />
          </CustomModal> */}

          {/* <CustomModal
            isOpen={transferProductModal}
            onClose={closeTransferProductModal}
            trigger={false}
            title="Transfer Product"
          >
            <TransferProduct
              closeModal={closeTransferProductModal}
              inventory={inventory}
            />
          </CustomModal> */}

          {/* <CustomModal
            isOpen={openReturnedProductModal}
            onClose={closeReturnedProductModal}
            trigger={false}
            title="Add Returned Product"
          >
            <ReturnProduct
              productId={inventory.id}
              closeModal={closeReturnedProductModal}
            />
          </CustomModal> */}
          {/* <CustomModal
            isOpen={openDamagedProductModal}
            onClose={closeDamagedProductModal}
            trigger={false}
            title="Add Damaged Product"
          >
            <DamagedProduct
              productId={inventory.id}
              closeModal={closeDamagedProductModal}
            />
          </CustomModal> */}

          {/* transfer product */}
        </>
      );
    },
  },
];
