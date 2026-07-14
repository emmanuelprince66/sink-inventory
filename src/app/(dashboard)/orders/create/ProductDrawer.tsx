"use client";

import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const ProductDrawer = ({
  open,
  onOpenChange,
  filteredInventoryData,
  onProductSelect,
  products,
  setSearchInput,
  isLoading,
  setPage,
  page,
}: {
  open: boolean;
  filteredInventoryData: any;
  onOpenChange: (open: boolean) => void;
  onProductSelect: (products: any[]) => void;
  products: any;
  setSearchInput: (input: string) => void;
  isLoading: boolean;
  setPage: (page: number) => void;
  page: number;
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!open) {
      // Reset selections when drawer closes
      setSelectedProducts([]);
      setSearchValue("");
      setPage(1);
    }
  }, [open]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setSearchInput(value);
    setPage(1); // Reset to first page on new search
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleAddProducts = () => {
    onProductSelect(selectedProducts);
    onOpenChange(false);
  };

  // Calculate pagination values
  const totalPages = products?.data?.pages || 1;
  const currentPage = page || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white w-full border border-grey-5 flex flex-col">
        <SheetHeader>
          <SheetTitle>Select Products</SheetTitle>
          <SheetDescription>
            Choose products to add to the order
          </SheetDescription>
        </SheetHeader>
        <div className="p-2">
          <SearchInput
            placeholder="Search products ..."
            value={searchValue}
            onValueChange={handleSearchChange}
          />
        </div>
        <div className="mt-2 space-y-4 flex-grow overflow-y-auto w-full">
          {isLoading ? (
            // Show skeleton loading states
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-3 space-y-2">
                <Skeleton className="bg-grey-5 h-6 w-3/4" />
                <Skeleton className="bg-grey-5 h-4 w-1/2" />
              </div>
            ))
          ) : filteredInventoryData?.length > 0 ? (
            // Show actual product data when loaded
            filteredInventoryData.map((product: any) => (
              <div
                key={product.id}
                className="m-2 p-3 border rounded-xl cursor-pointer hover:bg-grey-6 border-grey-5 hover:border-primary-green-300 transition-colors flex items-center justify-between"
              >
                <div
                  className="flex-grow"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-grey-1">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-grey-4">
                          {product.quantity} in stock
                        </p>
                        <p className="text-sm font-medium text-grey-4">-</p>
                        <p className="text-sm font-bold text-primary-green-300">
                          ₦{product.selling_price ?? product.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Checkbox
                  checked={selectedProducts.some((p) => p.id === product.id)}
                  onCheckedChange={() => handleSelectProduct(product)}
                  className="ml-4"
                />
              </div>
            ))
          ) : (
            <div className="text-center text-grey-4 p-4">
              No products found
            </div>
          )}
        </div>

        {/* Selected products count and add button */}
        <div className="flex justify-between items-center p-2 border-t border-grey-5">
          <div className="text-sm text-grey-3">
            {selectedProducts.length} product(s) selected
          </div>
          <Button
            onClick={handleAddProducts}
            disabled={selectedProducts.length === 0}
          >
            Add Selected
          </Button>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-2 border-t border-grey-5">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-grey-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProductDrawer;
