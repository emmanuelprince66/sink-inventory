import { Combo } from "@/api/combo/fetch-combos";
import { CustomModal } from "@/components/app/CustomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Package } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import DeleteCombo from "./DeleteCombo";

export const comboColumns: ColumnDef<Combo>[] = [
  {
    accessorKey: "name",
    header: "Combo",
    cell: ({ row }) => {
      const combo = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-grey-6 flex items-center justify-center shrink-0">
            {combo.image_url || combo.image ? (
              <Image
                src={combo.image_url || combo.image || ""}
                alt={combo.name}
                fill
                className="object-cover"
              />
            ) : (
              <Package className="h-4 w-4 text-grey-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{combo.name}</div>
            {combo.description && (
              <div className="text-xs text-grey-3 truncate max-w-[200px]">
                {combo.description}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const combo = row.original;
      return (
        <span className="text-sm text-grey-2">
          {combo.items?.length || 0} items
        </span>
      );
    },
  },
  {
    accessorKey: "original_total",
    header: "Original Total",
    cell: ({ row }) => (
      <span className="text-sm text-grey-3">
        {formatToNaira(row.original.original_total || 0)}
      </span>
    ),
  },
  {
    accessorKey: "combo_selling_price",
    header: "Selling Price",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-primary-green-300">
        {formatToNaira(row.original.combo_selling_price || 0)}
      </span>
    ),
  },
  {
    accessorKey: "sell_online",
    header: "Online",
    cell: ({ row }) => {
      const online = row.original.sell_online;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            online
              ? "bg-success-2 text-success-1"
              : "bg-grey-6 text-grey-3"
          }`}
        >
          {online ? "Yes" : "No"}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.created_at;
      if (!date) return <span className="text-sm text-grey-4">-</span>;
      return (
        <div className="text-sm text-grey-3">
          <div>{moment(date).format("MMM DD, YYYY")}</div>
          <div className="text-xs text-grey-4">
            {moment(date).format("h:mm A")}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ComboActions combo={row.original} />,
  },
];

const ComboActions = ({ combo }: { combo: Combo }) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

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
            asChild
            className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
          >
            <Link href={`/inventory/combo/${combo.id}`}>
              Edit Combo
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenDeleteModal(true)}
            className="cursor-pointer text-error-1 px-4 py-2 hover:bg-error-2 hover:text-error-1 transition-colors"
          >
            Delete Combo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        trigger={false}
        title="Delete combo"
      >
        <DeleteCombo
          closeModal={() => setOpenDeleteModal(false)}
          id={combo.id}
          name={combo.name}
        />
      </CustomModal>
    </>
  );
};
