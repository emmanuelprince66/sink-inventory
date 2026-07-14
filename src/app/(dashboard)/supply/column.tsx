import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { CustomModal } from "@/components/app/CustomModal";
import { formatToNaira } from "@/utils/formatMoney";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import DeleteSupplier from "./DeleteSupplier";
import { Supplier } from "./types";

export const columns: ColumnDef<Supplier>[] = [
  //   {
  //     accessorKey: "logo",
  //     header: "",
  //     cell: ({ row }) => {
  //       const supplier = row.original;
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
      const supplier = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-2">{supplier.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-3">{supplier.phone}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "wallet",
    header: "Wallet Balance",
    cell: ({ row }) => {
      const supplier = row.original;
      const isNegative = supplier.wallet < 0;

      return (
        <div className="font-medium">
          <p
            className={`text-sm font-medium ${
              isNegative ? "text-error-1" : "text-grey-2"
            }`}
          >
            {formatToNaira(supplier.wallet)}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "",
    header: "Action",
    cell: ({ row }) => {
      const router = useRouter();
      const [deleteSellerModal, setDeleteSellerModal] = useState(false);
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
                onClick={() => router.push(`/supply/${row.original.id}`)}
                className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors"
              >
                View more
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteSellerModal(true)}
                className="cursor-pointer px-4 py-2 text-error-1 hover:bg-error-2 hover:text-error-1 transition-colors"
              >
                Delete Supplier
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CustomModal
            isOpen={deleteSellerModal}
            onClose={() => setDeleteSellerModal(false)}
            trigger={false}
            title="Delete Supplier"
          >
            <DeleteSupplier
              closeModal={() => setDeleteSellerModal(false)}
              supplier={row.original}
            />
          </CustomModal>
        </>
      );
    },
  },
];
