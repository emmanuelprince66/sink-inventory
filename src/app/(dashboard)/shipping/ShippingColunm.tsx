import { CustomModal } from "@/components/app/CustomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DeleteShipping from "./DeleteShipping";
// import TransactionDetails from "./TransactionDetails";

export const columns: ColumnDef<any>[] = [
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
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const shipping = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">
            {shipping.created_at?.slice(0, 10)}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location ",
    cell: ({ row }) => {
      const shipping = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{shipping?.location}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description ",
    cell: ({ row }) => {
      const shipping = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{shipping?.description}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount ",
    cell: ({ row }) => {
      const shipping = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{shipping?.amount}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "visibility ",
    header: "Visibility",
    cell: ({ row }) => {
      const shipping = row.original;

      return (
        <div className="font-medium">
          <p className="px-4 py-3 whitespace-nowrap text-sm">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                shipping.visible === true
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {shipping.visible ? "Visible" : "Hidden"}
            </span>
          </p>
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const shipping = row.original;

      const [deleteShippingModal, setDeleteShippingModal] = useState(false);

      //   const [showEditShipping , setShowEditShipping] = useState(false)

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
              <Link href={`/shipping/${shipping.id}`}>
                <DropdownMenuItem className="cursor-pointer px-4 py-2 capitalize hover:bg-green-50 hover:text-green-600 transition-colors">
                  Edit Shipping
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                onClick={() => setDeleteShippingModal(true)}
                className="cursor-pointer px-4 py-2 capitalize hover:bg-green-50 hover:text-red-600 transition-colors"
              >
                Delete Shipping
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/*  */}
          <CustomModal
            isOpen={deleteShippingModal}
            onClose={() => setDeleteShippingModal(false)}
            title="Delete Shipping"
          >
            <DeleteShipping
              shipping={shipping}
              closeModal={() => setDeleteShippingModal(false)}
            />
          </CustomModal>{" "}
          *{/* transfer product */}
        </>
      );
    },
  },
];
