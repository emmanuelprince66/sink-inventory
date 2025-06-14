import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Product {
  product__image: string;
  product__name: string;
  product__selling_price: number;
  product__status: string;
  quantity_sold: number;
}

const ProductsInfo = ({ data }: { data: Product[] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = data.filter((product) =>
    product.product__name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "LOW":
        return "bg-amber-100 text-amber-800";
      case "OUT-OF-STOCK":
        return "bg-red-100 text-red-800";
      case "IN-STOCK":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-1">
      {/* Search Bar */}

      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow w-full mt-3">
        <table className="divide-y divide-gray-200 w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sold
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 w-full">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-1 py-4 whitespace-nowrap">
                    <div className="flex items-center ">
                      {/* <div className="flex-shrink-0 h-10 w-10">
                        <img
                          src={product.product__image}
                          alt={product.product__name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      </div> */}
                      <div className="ml-4 overflow-hidden">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {product.product__name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₦{product.product__selling_price?.toLocaleString() ?? "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(
                        product.product__status
                      )}`}
                    >
                      {product.product__status.replace(/-/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {product.quantity_sold}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No products found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsInfo;
