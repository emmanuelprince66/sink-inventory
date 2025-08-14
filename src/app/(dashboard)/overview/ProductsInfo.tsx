import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = data.filter((product) => {
    // Filter by search term
    const matchesSearch = product.product__name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by tab selection
    let matchesTab = true;
    if (activeTab === "low") {
      matchesTab = product.product__status === "LOW";
    } else if (activeTab === "in-stock") {
      matchesTab = product.product__status === "IN-STOCK";
    } else if (activeTab === "out-of-stock") {
      matchesTab = product.product__status === "OUT-OF-STOCK";
    }

    return matchesSearch && matchesTab;
  });

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
    <div className="p-1 md:p-4">
      {/* Search Bar */}
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
        className="mb-4 w-full"
      />

      {/* Tabs */}
      <Tabs
        className="mt-3"
        defaultValue="all"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="in-stock" className="text-xs sm:text-sm">
            In Stock
          </TabsTrigger>
          <TabsTrigger value="low" className="text-xs sm:text-sm">
            Low
          </TabsTrigger>
          <TabsTrigger value="out-of-stock" className="text-xs sm:text-sm">
            Out
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <div className="bg-white rounded-lg shadow w-full mt-3 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sold
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-0 sm:ml-4 overflow-hidden">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                          {product.product__name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₦{product.product__selling_price?.toLocaleString() ?? "0"}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(
                        product.product__status
                      )}`}
                    >
                      <span className="hidden sm:inline">
                        {product.product__status.replace(/-/g, " ")}
                      </span>
                      <span className="sm:hidden">
                        {product.product__status === "IN-STOCK"
                          ? "In"
                          : product.product__status === "OUT-OF-STOCK"
                          ? "Out"
                          : "Low"}
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
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
