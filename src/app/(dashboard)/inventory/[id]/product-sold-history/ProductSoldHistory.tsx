import { Skeleton } from "@/components/ui/skeleton";

const ProductSoldHistory = ({ id }: { id: string }) => {
  const dataArray = [
    {
      created_at: new Date(),
      new_qty: 10,
      qty_change: 20,
      sold_by: "John Doe",
    },
    // Add more sample data if needed
    {
      created_at: new Date(Date.now() - 86400000), // Yesterday
      new_qty: 15,
      qty_change: -5,
      sold_by: "Jane Smith",
    },
  ];

  return (
    <div className="container px-4">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Transfer History
        </h1>
      </div>

      {false ? (
        <div className="w-full">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-[#eef4ef] mt-2" />
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sold By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataArray.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.created_at.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.new_qty}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      item.qty_change >= 0 ? "text-green-600" : "text-red-600"
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
  );
};

export default ProductSoldHistory;
