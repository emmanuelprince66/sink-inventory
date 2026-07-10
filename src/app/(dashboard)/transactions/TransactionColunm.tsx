import { CustomModal } from "@/components/app/CustomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import TransactionDetails from "./TransactionDetails";

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
    accessorKey: "trx",
    header: "Transaction ID",
    cell: ({ row }) => {
      const trx = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm font-medium text-primary-green-300">{trx.id?.slice(0, 10)}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "Customer",
    header: "Customer ",
    cell: ({ row }) => {
      const trx = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-2">{trx?.account_name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "Type",
    header: "Type ",
    cell: ({ row }) => {
      const trx = row.original;
      return (
        <div className="font-medium">
          <p className="px-4 py-3 whitespace-nowrap text-sm">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trx.type === "CREDIT"
                  ? "bg-success-2 text-success-1"
                  : "bg-error-2 text-error-1"
              }`}
            >
              {trx.type}
            </span>
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount ",
    cell: ({ row }) => {
      const trx = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm font-bold text-grey-1">{trx?.amount}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "account_number",
    header: "Account Number",
    cell: ({ row }) => {
      const trx = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-3">{trx?.account_number}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date ",
    cell: ({ row }) => {
      const trx = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-3">
            {moment(trx.created_at).format("MMM D, YYYY h:mm A")}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const trx = row.original;

      return (
        <div className="font-medium">
          <p className="px-4 py-3 whitespace-nowrap text-sm">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trx.status === "SUCCESS"
                  ? "bg-success-2 text-success-1"
                  : trx.status === "PENDING"
                  ? "bg-warning-2 text-warning-1"
                  : "bg-error-2 text-error-1"
              }`}
            >
              {trx.status}
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
      const trx = row.original;
      const [showTrxDetails, setShowTrxDetails] = useState(false);

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
                onClick={() => setShowTrxDetails(true)}
                className="cursor-pointer px-4 py-2 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
              >
                View More
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/*  */}

          <CustomModal
            isOpen={showTrxDetails}
            onClose={() => setShowTrxDetails(false)}
            title="Transaction Details"
          >
            <TransactionDetails transaction={trx} />
          </CustomModal>
          {/* transfer product */}
        </>
      );
    },
  },
];
