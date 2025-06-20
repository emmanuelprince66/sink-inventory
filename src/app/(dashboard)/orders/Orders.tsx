"use client";
import { CustomCard } from "@/components/app/CustomCard";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatToNaira } from "@/utils/formatMoney";
import Link from "next/link";
import { useState } from "react";

// Dummy data
const orderStats = {
  totalOrders: 1245,
  completedOrders: 892,
  totalRevenue: 12560000,
  totalLinkVisits: 3245,
};

const ordersData = [
  {
    id: "#ORD-001",
    date: "2023-10-15",
    name: "John Doe",
    product: "Wireless Headphones",
    amount: 45000,
    type: "Online",
    status: "Processing",
    paymentStatus: "Paid",
    shipping: "Pending",
  },
  {
    id: "#ORD-002",
    date: "2023-10-14",
    name: "Jane Smith",
    product: "Smart Watch",
    amount: 65000,
    type: "In-store",
    status: "Completed",
    paymentStatus: "Paid",
    shipping: "Delivered",
  },
  {
    id: "#ORD-003",
    date: "2023-10-13",
    name: "Michael Johnson",
    product: "Bluetooth Speaker",
    amount: 32000,
    type: "Online",
    status: "Shipped",
    paymentStatus: "Paid",
    shipping: "In Transit",
  },
  {
    id: "#ORD-004",
    date: "2023-10-12",
    name: "Sarah Williams",
    product: "Fitness Tracker",
    amount: 28000,
    type: "Online",
    status: "Completed",
    paymentStatus: "Paid",
    shipping: "Delivered",
  },
  {
    id: "#ORD-005",
    date: "2023-10-11",
    name: "David Brown",
    product: "Phone Case",
    amount: 8000,
    type: "In-store",
    status: "Cancelled",
    paymentStatus: "Refunded",
    shipping: "N/A",
  },
];

const Orders = () => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Orders
          </p>

          <div className="gap-2 flex items-center flex-wrap">
            <Button>Create Order</Button>
          </div>
        </div>
      </div>

      {false ? (
        <div className="flex gap-4 w-[80%]">
          {Array.from({ length: 4 }).map((_, index) => (
            <CustomCard key={index} className="w-full border-gray-200">
              <div className="flex flex-col gap-6 items-start">
                <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CustomCard className="border border-gray-200 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold mt-2">
                {orderStats.totalOrders}
              </p>
              <p className="text-xs text-green-500 mt-1">
                +12% from last month
              </p>
            </CustomCard>

            <CustomCard className="border border-gray-200 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500">Order Completed</h3>
              <p className="text-2xl font-bold mt-2">
                {orderStats.completedOrders}
              </p>
              <p className="text-xs text-green-500 mt-1">
                {Math.round(
                  (orderStats.completedOrders / orderStats.totalOrders) * 100
                )}
                % success rate
              </p>
            </CustomCard>

            <CustomCard className="border border-gray-200 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold mt-2">
                {formatToNaira(orderStats.totalRevenue)}
              </p>
              <p className="text-xs text-green-500 mt-1">+8% from last month</p>
            </CustomCard>

            {/* <CustomCard className="border border-gray-200 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500">Total Link Visit</h3>
              <p className="text-2xl font-bold mt-2">
                {orderStats.totalLinkVisits}
              </p>
              <p className="text-xs text-green-500 mt-1">+5% from last month</p>
            </CustomCard> */}
          </div>

          <div className="w-full mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="w-full md:w-1/2 mb-4 mt-4">
                <SearchInput
                  placeholder="Search ..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
                {searchInput.length > 0 && searchInput.length < 3 && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    Type at least 3 characters to search
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Filter</Button>
                <Button variant="outline">Export</Button>
              </div>
            </div>

            <div className="overflow-x-auto ">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID/Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name/Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipping
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersData.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {order.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{order.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.product}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {formatToNaira(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.type === "Online"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : order.paymentStatus === "Refunded"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.shipping === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.shipping === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.shipping === "In Transit"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.shipping}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href="#"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing 1 to 5 of {ordersData.length} entries
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
