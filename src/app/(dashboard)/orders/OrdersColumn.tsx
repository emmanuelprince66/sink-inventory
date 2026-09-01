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
import moment from "moment";
import { useState } from "react";

import Link from "next/link";
import { OrderInfo } from "./type";

const statusColors = {
  PAID: "bg-green-100 text-green-800",
  PARTIAL: "bg-yellow-100 text-yellow-800",
  UNPAID: "bg-red-100 text-red-800",
  DEFAULT: "bg-gray-100 text-gray-800",
} as const;

const statusTextMap = {
  PAID: "paid",
  PARTIAL: "partially paid",
  UNPAID: "unpaid",
  DEFAULT: "unknown",
} as const;

const shippingColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  DEFAULT: "bg-gray-100 text-gray-800",
} as const;

const shippingTextMap = {
  PENDING: "Pending",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  DEFAULT: "Unknown",
} as const;

// Mock rider/delivery data — stable per order id until backend ships these fields.
const MOCK_DELIVERY_COMPANIES = [
  "Shipbubble",
  "Kwik Delivery",
  "GIG Logistics",
  "DHL Express",
  "In-house Riders",
];
const MOCK_RIDERS = [
  { name: "Emeka Obi", phone: "+234 803 111 2233" },
  { name: "Bola Adeyemi", phone: "+234 805 444 5566" },
  { name: "Yusuf Bala", phone: "+234 808 777 8899" },
  { name: "Chinwe Eze", phone: "+234 814 222 3344" },
  { name: "Ifeanyi Okeke", phone: "+234 816 555 6677" },
];

const hashSeed = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
};
const mockDeliveryFor = (id: string) => {
  const seed = hashSeed(id || "fallback");
  return {
    company: MOCK_DELIVERY_COMPANIES[seed % MOCK_DELIVERY_COMPANIES.length],
    rider: MOCK_RIDERS[seed % MOCK_RIDERS.length],
  };
};

export const useOrdersColumn = (type: string) => {
  const columns: ColumnDef<OrderInfo>[] = [
    {
      accessorKey: "customer_info",
      header: "Customer Name",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="font-medium">{order.customer_info?.name ?? "-"}</div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <span>
            {formatToNaira(Number(order.amount ?? order.total_price ?? 0))}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div
            className={`font-medium p-1 flex justify-center rounded-md text-xs ${
              order.type === "OUTSTORE"
                ? "text-blue-600 bg-blue-100"
                : "text-purple-600 bg-purple-100"
            }`}
          >
            {order.type}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.created_at;
        if (!date) return <div className="text-sm text-gray-400">-</div>;
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {moment(date).format("MMM DD, YYYY")}
            </div>
            <div className="text-xs text-gray-500">
              {moment(date).format("h:mm A")}
            </div>
          </div>
        );
      },
    },
    // Payment status column stays
    {
      accessorKey: "status",
      header: "Payment Status",
      cell: ({ row }) => {
        const order = row.original;
        const status = order.payment_status || "DEFAULT";
        const statusClass =
          statusColors[status as keyof typeof statusColors] ||
          statusColors.DEFAULT;

        const statusTextValue =
          statusTextMap[status as keyof typeof statusTextMap] || "unknown";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
          >
            {statusTextValue}
          </span>
        );
      },
    },
  ];

  // Conditionally add shipping columns only when not INSTORE
  if (type !== "INSTORE") {
    const shippingStatusColumn: ColumnDef<OrderInfo> = {
      accessorKey: "shipping_status",
      header: "Shipping Status",
      cell: ({ row }) => {
        const order = row.original;
        const status = order.shipping_status || "DEFAULT";
        const statusClass =
          shippingColors[status as keyof typeof shippingColors] ||
          shippingColors.DEFAULT;

        const statusTextValue =
          shippingTextMap[status as keyof typeof shippingTextMap] || "unknown";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
          >
            {statusTextValue}
          </span>
        );
      },
    };

    const shippingFeeColumn: ColumnDef<OrderInfo> = {
      accessorKey: "shipping_fee",
      header: "Shipping Fee",
      cell: ({ row }) => {
        const order = row.original;
        return <span>{formatToNaira(Number(order.shipping_fee ?? 0))}</span>;
      },
    };

    const deliveryCompanyColumn: ColumnDef<OrderInfo> = {
      id: "delivery_company",
      header: "Delivery Company",
      cell: ({ row }) => {
        const order = row.original;
        const mock = mockDeliveryFor(order.id || "");
        return <span className="text-sm text-gray-700">{mock.company}</span>;
      },
    };

    const riderColumn: ColumnDef<OrderInfo> = {
      id: "rider",
      header: "Rider",
      cell: ({ row }) => {
        const order = row.original;
        const mock = mockDeliveryFor(order.id || "");
        return (
          <div className="leading-tight">
            <div className="text-sm font-medium text-gray-900">
              {mock.rider.name}
            </div>
            <div className="text-xs text-gray-500">{mock.rider.phone}</div>
          </div>
        );
      },
    };

    columns.push(
      shippingStatusColumn,
      shippingFeeColumn,
      deliveryCompanyColumn,
      riderColumn,
    );
  }

  // Actions column
  columns.push({
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const order = row.original;
      const [openViewDetails, setOpenViewDetails] = useState(false);
      const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

      const openViewDetailsFunc = () => {
        setOpenViewDetails(true);
      };

      const handleDelete = () => {
        // Implement delete logic here, e.g., API call
        console.log("Delete order:", order.id);
        setShowDeleteConfirm(false);
      };

      const confirmDelete = () => {
        setShowDeleteConfirm(true);
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
              <Link href={`/orders/${order.id}`}>
                <DropdownMenuItem className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors">
                  View
                </DropdownMenuItem>
              </Link>

              {/* <DropdownMenuItem
                onClick={confirmDelete}
                className="cursor-pointer px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>

          <CustomModal
            isOpen={openViewDetails}
            onClose={() => setOpenViewDetails(false)}
            trigger={false}
            title="View Details"
          >
            <></>
            {/* <ViewDetails
            closeModal={() => setOpenViewDetails(false)}
            data={order}
          /> */}
          </CustomModal>

          <CustomModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            trigger={false}
            title="Confirm Delete"
          >
            <div className="p-4">
              <p>Are you sure you want to delete this order?</p>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </CustomModal>
        </>
      );
    },
  });

  return columns;
};
