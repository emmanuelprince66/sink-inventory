import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  Box,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";

const ProductSoldHistory = ({ id }: { id: string }) => {
  // Sample data
  const dataArray = [
    {
      created_at: new Date(),
      new_qty: 10,
      qty_change: 20,
      sold_by: "John Doe",
      type: "purchase",
    },
    {
      created_at: new Date(Date.now() - 86400000), // Yesterday
      new_qty: 15,
      qty_change: -5,
      sold_by: "Jane Smith",
      type: "sold",
    },
    {
      created_at: new Date(Date.now() - 172800000), // 2 days ago
      new_qty: 20,
      qty_change: 3,
      sold_by: "Mike Johnson",
      type: "transfer-in",
    },
    {
      created_at: new Date(Date.now() - 259200000), // 3 days ago
      new_qty: 17,
      qty_change: -2,
      sold_by: "Sarah Williams",
      type: "returned",
    },
  ];

  // Calculate summary data
  const summary = {
    netSales: 12500,
    cost: 8500,
    profit: 4000,
    quantitiesIn: {
      purchase: 50,
      soldReversal: 3,
      transferIn: 12,
    },
    quantitiesOut: {
      sold: 35,
      returned: 5,
      removed: 2,
      transferOut: 8,
    },
  };

  // Get icon for transaction type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case "sold":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case "transfer-in":
        return <Truck className="h-4 w-4 text-green-500" />;
      case "returned":
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case "sold-reversal":
        return <RotateCcw className="h-4 w-4 text-purple-500" />;
      case "removed":
        return <Trash2 className="h-4 w-4 text-gray-500" />;
      case "transfer-out":
        return <Truck className="h-4 w-4 text-orange-500" />;
      default:
        return <Box className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className=" px-4 py-6 w-full ">
      {/* Product Header */}
      <div className="bg-white rounded-lg  p-6 mb-6 ">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Product Sold History
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Product Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Product Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-32">
                  Product Name:
                </span>
                <span className="text-sm text-gray-800">
                  Premium Coffee Beans
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-32">
                  Category:
                </span>
                <span className="text-sm text-gray-800">Beverages</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-32">
                  Current Stock:
                </span>
                <span className="text-sm font-medium text-blue-600">
                  42 units
                </span>
              </div>
            </div>
          </div>

          {/* Quantities Summary */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantities In */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-3">
                <ArrowUp className="h-4 w-4 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-blue-800">
                  Quantities In
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center">
                    <ShoppingCart className="h-3 w-3 mr-1" /> Purchase
                  </span>
                  <span className="text-sm font-medium">
                    {summary.quantitiesIn.purchase}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center">
                    <RotateCcw className="h-3 w-3 mr-1" /> Sold Reversal
                  </span>
                  <span className="text-sm font-medium">
                    {summary.quantitiesIn.soldReversal}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center">
                    <Truck className="h-3 w-3 mr-1" /> Transfer In
                  </span>
                  <span className="text-sm font-medium">
                    {summary.quantitiesIn.transferIn}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantities Out */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-center mb-3">
                <ArrowDown className="h-4 w-4 text-red-500 mr-2" />
                <h3 className="text-sm font-medium text-red-800">
                  Quantities Out
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" /> Sold
                  </span>
                  <span className="text-sm font-medium">
                    {summary.quantitiesOut.sold}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1" /> Returned
                  </span>
                  <span className="text-sm font-medium">
                    {summary.quantitiesOut.returned}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center">
                    <Trash2 className="h-3 w-3 mr-1" /> Removed
                  </span>
                  <span className="text-sm font-medium">
                    {summary.quantitiesOut.removed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center">
                    <Truck className="h-3 w-3 mr-1" /> Transfer Out
                  </span>
                  <span className="text-sm font-medium">
                    {summary.quantitiesOut.transferOut}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Financial Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-800">
                  Net Sales
                </span>
                <span className="text-lg font-bold">
                  ₦{summary.netSales.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-yellow-800">
                  Cost
                </span>
                <span className="text-lg font-bold">
                  ₦{summary.cost.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-purple-800">
                  Profit
                </span>
                <span className="text-lg font-bold">
                  ₦{summary.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex w-full justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700">
              Transaction History
            </h2>
          </div>

          {false ? (
            <div className="w-full">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-[#eef4ef]" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-16 w-full bg-[#eef4ef] mt-2"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataArray.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.created_at.toLocaleDateString()} at{" "}
                        {item.created_at.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {/* {getTransactionIcon(item.type)} */}
                          <span className="ml-2 capitalize">
                            {item.type.replace("-", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.new_qty}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          item.qty_change >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.qty_change >= 0 ? "+" : ""}
                        {item.qty_change}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sold_by}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSoldHistory;
