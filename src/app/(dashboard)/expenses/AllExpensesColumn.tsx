import { CustomModal } from "@/components/app/CustomModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import DeleteExpense from "./DeleteExpense";
import ViewMore from "./ViewMore";

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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const expenses = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{expenses.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category ",
    cell: ({ row }) => {
      const expenses = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{expenses?.category?.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const expenses = row.original;

      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{expenses?.date}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const expenses = row.original;

      return (
        <div className="font-medium">
          <p className="text-sm text-red-500">
            {formatToNaira(expenses.amount)}
          </p>
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const expenses = row.original;

      const [viewMore, setViewMore] = useState(false);
      const [deleteExpenseModal, setDeleteExpenseModal] = useState(false);

      const openDeleteExpenseModalFunc = () => {
        setDeleteExpenseModal(true);
      };
      const closeDeleteExpenseModalFunc = () => {
        setDeleteExpenseModal(false);
      };
      const openViewMoreModalFunc = () => {
        setViewMore(true);
      };
      const closeViewMoreModalFunc = () => {
        setViewMore(false);
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
                onClick={openViewMoreModalFunc}
                className="cursor-pointer px-4 py-2 capitalize hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                View More
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={openDeleteExpenseModalFunc}
                className="cursor-pointer text-red-500 px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/*  */}

          {/* transfer product */}

          <CustomModal
            isOpen={viewMore}
            onClose={closeViewMoreModalFunc}
            trigger={false}
            title="View Details"
          >
            <ViewMore expenses={expenses} />
          </CustomModal>
          <CustomModal
            isOpen={deleteExpenseModal}
            onClose={closeDeleteExpenseModalFunc}
            trigger={false}
            title="Delete Expense"
          >
            <DeleteExpense
              expense={expenses}
              closeModal={closeDeleteExpenseModalFunc}
            />
          </CustomModal>
        </>
      );
    },
  },
];
