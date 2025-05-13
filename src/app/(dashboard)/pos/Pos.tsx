"use client";

import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { usePosHook } from "@/hooks/usePosHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const Pos = () => {
  const [searchInput, setSearchInput] = useState("");
  const { ProductData, ProductDataLoading, page, setPage } = usePosHook({
    searchInput,
  });
  const [cartItems, setCartItems] = useState<Array<any>>([]);
  const { showToast } = useToast();

  const statusColors = {
    "IN-STOCK": "bg-green-100 text-green-800",
    LOW: "bg-yellow-100 text-yellow-800",
    "OUT-OF-STOCK": "bg-red-100 text-red-800",
    DEFAULT: "bg-gray-100 text-gray-800",
  };

  const getStatusColor = (status: string) => {
    const upperStatus = status?.toUpperCase();
    if (upperStatus && statusColors.hasOwnProperty(upperStatus)) {
      return statusColors[upperStatus as keyof typeof statusColors];
    }
    return statusColors.DEFAULT;
  };

  const handleAddToCart = (cart: any) => {
    // Check if item is out of stock or has 0 quantity
    if (cart.quantity === 0 || cart.status === "OUT-OF-STOCK") {
      console.error(
        "Cannot add item to cart: Item is out of stock or has 0 quantity"
      );
      showToast("This item is out of stock", "error");
      return;
    }

    const itemExists = cartItems.some((item) => item.id === cart.id);
    if (itemExists) {
      showToast("Item already exists in cart", "error");
      return;
    }
    setCartItems([...cartItems, { ...cart, cartQuantity: 1 }]);
  };

  const clearCartFunc = () => {
    setCartItems([]);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page when searching
  };

  const totalPages = ProductData?.data?.pages || 1;

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <header className="w-full h-16 bg-gray-100 border-b border-gray-300 flex items-center px-4">
        <p className="text-xl font-bold">POS System</p>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products Section */}
        <main className="w-[70%] h-full border-r border-gray-300 p-4 overflow-y-auto">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <div className="flex items-center gap-2">
              <div className="w-64">
                <SearchInput
                  placeholder="Search product..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {ProductDataLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg bg-gray-200" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {ProductData?.data?.results?.data?.map((product: any) => {
                  const isOutOfStock =
                    product.quantity === 0 || product.status === "OUT-OF-STOCK";
                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product)}
                      className={`border rounded-lg p-3 transition-shadow duration-300 ${
                        isOutOfStock
                          ? "border-gray-200 cursor-not-allowed opacity-50"
                          : "hover:border-green-300 border-gray-200 cursor-pointer group"
                      }`}
                    >
                      <div className="relative h-32 mb-2 rounded overflow-hidden bg-gray-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className={`object-cover ${
                              !isOutOfStock &&
                              "group-hover:scale-105 transition-transform duration-300"
                            }`}
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {/* {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                            <span className="text-red-500 font-bold">
                              Out of Stock
                            </span>
                          </div>
                        )} */}
                      </div>
                      <h3 className="font-medium text-sm truncate">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm font-semibold text-primary">
                          {formatToNaira(
                            product.selling_price || product.amount
                          ) ?? "N/A"}
                        </p>
                        {product.type === "PRODUCT" && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {product.status || "N/A"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }).map(
                      (_, i) => {
                        // Show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Cart Sidebar */}
        {/* <aside className="w-[30%] h-full bg-gray-50 p-4 overflow-y-auto">
          {cartItems.length > 0 ? (
            <CheckoutPage
              setCartItems={setCartItems}
              cartItems={cartItems}
              clearCartFunc={clearCartFunc}
            />
          ) : (
            <NoCartItem />
          )}
        </aside> */}
      </div>
    </div>
  );
};

export default Pos;
