"use client";

import NoCartItem from "@/components/app/NoCartItem";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { usePosHook } from "@/hooks/usePosHook";
import { useCartStore } from "@/lib/store/cart-store";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { ScannerButton } from "./ScannerButton";

const CheckoutPage = dynamic(() => import("./CheckoutPage"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full">
      <Spinner className="text-primary-green-300" />
    </div>
  ),
});

const Pos = () => {
  const [searchInput, setSearchInput] = useState("");

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart: clearCartFunc,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();
  const {
    ProductData,
    handleScanResult,
    handleAddToCart,
    ProductDataLoading,
    page,
    scannedProductLoading,
    setPage,
  } = usePosHook({
    searchInput,
    setSearchInput,
    addToCart,
    cartItems,
  });

  console.log("product data", ProductData);
  console.log("cartItems", cartItems);

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

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const totalPages = ProductData?.data?.pages || 1;

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header with fixed height */}
      <header className="w-full h-16 min-h-[4rem] bg-gray-100 border-b border-gray-300 flex items-center px-4">
        <p className="text-xl md:text-2xl font-bold">POS System</p>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Products Section */}
        <main className="w-full md:w-[70%] h-full border-r border-gray-300 p-4 overflow-y-auto">
          <div className="w-full flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
            <h2 className="text-lg md:text-xl font-semibold">Products</h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="w-full md:w-64">
                <SearchInput
                  placeholder="Search product..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
              </div>
              {/* Scanner Button */}

              {scannedProductLoading ? (
                <Button variant="outline" disabled>
                  <Spinner className="text-primary-green-300" />
                </Button>
              ) : (
                <ScannerButton
                  onScanResult={handleScanResult}
                  variant="outline"
                  size="default"
                />
              )}
            </div>
          </div>

          {ProductDataLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-24 md:h-32 w-full rounded-lg bg-gray-200" />
                  <Skeleton className="h-3 md:h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-3 md:h-4 w-1/2 bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 md:gap-1">
                {ProductData?.data?.results?.data?.map((product: any) => {
                  const isOutOfStock =
                    product.quantity === 0 || product.status === "OUT-OF-STOCK";
                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && handleAddToCart(product)}
                      className={`border rounded-lg p-2 md:p-2 transition-shadow duration-300 ${
                        isOutOfStock
                          ? "border-gray-200 cursor-not-allowed opacity-50"
                          : "hover:border-green-300 border-gray-200 cursor-pointer group"
                      }`}
                    >
                      <div className="relative h-20 md:h-32 mb-2 rounded overflow-hidden bg-gray-100">
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
                      </div>
                      <h3 className="font-medium text-[8px] md:text-[11px] truncate">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] md:text-[10px] font-semibold text-primary">
                          {formatToNaira(
                            product.selling_price || product.amount
                          ) ?? "N/A"}
                        </p>
                        {product.type === "PRODUCT" && (
                          <p
                            className={`text-[8px] px-2 py-1 rounded-full ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {product.status || "N/A"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 md:mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {Array.from({ length: Math.min(totalPages, 5) }).map(
                      (_, i) => {
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

        {/* Cart Sidebar - now responsive */}
        <aside className="w-full md:w-[30%] h-full bg-gray-50 p-3 md:p-4 overflow-y-auto border-t md:border-t-0 border-gray-300">
          {cartItems.length > 0 ? (
            <CheckoutPage clearCartFunc={clearCartFunc} />
          ) : (
            <NoCartItem />
          )}
        </aside>
      </div>
    </div>
  );
};

export default Pos;
