"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useProductHook } from "@/hooks/useProductHook";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  RotateCcw,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useState } from "react";
import ProductSoldData from "./ProductSoldData";

const ProductSoldHistory = ({ id }: { id: string }) => {
  const [page, setPage] = useState(1);

  const { ProductTransactionData, ProductTransactionLoading } = useProductHook({
    id,
    page,
  });

  const productData = ProductTransactionData?.data?.results;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 mr-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-xl ml-3 sm:text-2xl font-extrabold text-grey-1">
          Product Sold History
        </h1>
      </div>

      {/* Product Details + Quantities */}
      <div className="bg-white rounded-2xl border border-grey-5 p-4 sm:p-6">
        {!productData || ProductTransactionLoading ? (
          <div className="w-full flex items-center gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full bg-grey-6" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Info */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold text-grey-1 border-b border-grey-6 pb-2 uppercase tracking-wide">
                Product Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-grey-3 w-32">
                    Product Name:
                  </span>
                  <span className="text-sm font-medium text-grey-1">
                    {productData?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-grey-3 w-32">
                    Category:
                  </span>
                  <span className="text-sm font-medium text-grey-1">
                    {productData?.category || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-grey-3 w-32">
                    Current Stock:
                  </span>
                  <span className="text-sm font-bold text-primary-green-300">
                    {productData?.quantity || 0} units
                  </span>
                </div>
              </div>
            </div>

            {/* Quantities Summary */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantities In */}
              <div className="bg-info-2 p-4 rounded-2xl">
                <div className="flex items-center mb-3">
                  <ArrowUp className="h-4 w-4 text-info-1 mr-2" />
                  <h3 className="text-sm font-extrabold text-info-1">
                    Quantities In
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-grey-3 flex items-center">
                      <ShoppingCart className="h-3 w-3 mr-1" /> Purchase
                    </span>
                    <span className="text-sm font-bold text-grey-1">
                      {productData?.purchase || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-grey-3 flex items-center">
                      <Truck className="h-3 w-3 mr-1" /> Transfer In
                    </span>
                    <span className="text-sm font-bold text-grey-1">
                      {productData?.transfer_in || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantities Out */}
              <div className="bg-error-2 p-4 rounded-2xl">
                <div className="flex items-center mb-3">
                  <ArrowDown className="h-4 w-4 text-error-1 mr-2" />
                  <h3 className="text-sm font-extrabold text-error-1">
                    Quantities Out
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-grey-3 flex items-center">
                      <ArrowDown className="h-3 w-3 mr-1" /> Sold
                    </span>
                    <span className="text-sm font-bold text-grey-1">
                      {productData?.sold || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-grey-3 flex items-center">
                      <RotateCcw className="h-3 w-3 mr-1" /> Returned
                    </span>
                    <span className="text-sm font-bold text-grey-1">
                      {productData?.returned || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-grey-3 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Damaged
                    </span>
                    <span className="text-sm font-bold text-grey-1">
                      {productData?.damaged || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-grey-3 flex items-center">
                      <Truck className="h-3 w-3 mr-1" /> Transfer Out
                    </span>
                    <span className="text-sm font-bold text-grey-1">
                      {productData?.transfer_out || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="flex w-full justify-between items-center p-4 sm:p-6 pb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-grey-1">
            Transaction History
          </h2>
        </div>

        {ProductTransactionLoading || !ProductTransactionData ? (
          <div className="w-full px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full bg-grey-6" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full bg-grey-6 mt-2" />
              ))}
            </div>
          </div>
        ) : (
          <div className="pb-4 sm:pb-6">
            <ProductSoldData
              setPage={setPage}
              page={page}
              productSoldLoading={ProductTransactionLoading}
              productSoldData={ProductTransactionData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSoldHistory;
