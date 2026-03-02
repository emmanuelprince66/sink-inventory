"use client";

import { CustomModal } from "@/components/app/CustomModal";
import NoCartItem from "@/components/app/NoCartItem";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { usePosHook } from "@/hooks/usePosHook";
import { useCartStore } from "@/lib/store/cart-store";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronLeft, ChevronRight, FileText, Package } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import GeneratePresaleCodeModal from "./GeneratePresaleCodeModal";
import LoadPresaleModal from "./LoadPresaleModal";
import { ScannerButton } from "./ScannerButton";
import VariationSelectorModal from "./VariationSelectorModal";

const CheckoutPage = dynamic(() => import("./CheckoutPage"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full">
      <Spinner className="text-primary-green-300" />
    </div>
  ),
});

// Types
interface Variation {
  id: string;
  name: string;
  sku: string;
  status: string;
  selling_price: number;
  quantity: number;
  cost_price?: number;
  discount?: number;
  discount_threshold?: number;
  expiry_date?: string;
  low_stock_threshold?: number;
  sold?: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  status: string;
  selling_price?: number;
  amount?: number;
  quantity?: number;
  image?: string;
  type: string;
  category?: string;
  variations?: Variation[];
  unit?: string;
  discount?: number;
  discount_threshold?: number;
}

const Pos: React.FC = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVariationModal, setShowVariationModal] = useState<boolean>(false);
  const [showGeneratePresaleModal, setShowGeneratePresaleModal] =
    useState<boolean>(false);
  const [showLoadPresaleModal, setShowLoadPresaleModal] =
    useState<boolean>(false);

  const { user } = useUserRole();
  const userRole = user?.role;

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
    businessData, // ADD THIS
  } = usePosHook({
    searchInput,
    setSearchInput,
    addToCart,
    cartItems,
  });
  const { showToast } = useToast();

  const statusColors: Record<string, string> = {
    "IN-STOCK": "bg-green-100 text-green-800",
    LOW: "bg-yellow-100 text-yellow-800",
    "OUT-OF-STOCK": "bg-red-100 text-red-800",
    DEFAULT: "bg-gray-100 text-gray-800",
  };

  const getStatusColor = (status: string): string => {
    const upperStatus = status?.toUpperCase();
    if (upperStatus && statusColors.hasOwnProperty(upperStatus)) {
      return statusColors[upperStatus];
    }
    return statusColors.DEFAULT;
  };

  const getProductPriceDisplay = (product: Product): string => {
    if (product.variations && product.variations.length > 0) {
      const prices = product.variations.map((v) => v.selling_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return formatToNaira(minPrice);
      }

      return `${formatToNaira(minPrice)} - ${formatToNaira(maxPrice)}`;
    }

    return formatToNaira(product.selling_price || product.amount || 0);
  };

  const handleProductClick = (product: Product): void => {
    const isOutOfStock =
      product.quantity === 0 || product.status === "OUT-OF-STOCK";

    if (isOutOfStock) return;

    // If product has variations, show modal
    if (product.variations && product.variations.length > 0) {
      setSelectedProduct(product);
      setShowVariationModal(true);
    } else {
      // If no variations, add directly
      handleAddToCart(product);
    }
  };

  const handleAddVariations = (variations: any[]): void => {
    variations.forEach((variation) => {
      addToCart({
        ...variation,
        id: variation.id,
        name: `${variation.name}`,
        selling_price: variation.selling_price,
        amount: variation.selling_price,
        quantity: variation.quantity,
        cartQuantity: variation.cartQuantity,
        type: variation.type,
        category: variation.category,
        sku: variation.sku,
        discount: variation.discount,
        discount_threshold: variation.discount_threshold,
        status: variation.status,
        parentProductId: variation.parentProductId,
        parentProductName: variation.parentProductName,
        parentProductVariations: variation.parentProductVariations,
      });
    });

    showToast(`${variations.length} variation(s) added to cart`, "success");
  };

  const handleSearchChange = (value: string): void => {
    setSearchInput(value);
    setPage(1);
  };

  const handleAddPresaleToCart = (products: any[]): void => {
    products.forEach((product) => {
      addToCart({
        ...product,
        id: product.id,
        name: product.name,
        selling_price: product.selling_price || product.amount,
        amount: product.amount || product.selling_price,
        cartQuantity: product.quantity || product.cartQuantity || 1,
        type: product.type,
        category: product.category,
        sku: product.sku,
        discount: product.discount,
        discount_threshold: product.discount_threshold,
        status: product.status,
        quantity: product.quantity,
      });
    });
  };

  const totalPages = ProductData?.data?.pages || 1;

  // Determine if user can access presale features
  const isPharmacist = userRole === "PHARMACIST";
  const isAttendant = userRole === "ATTENDANT";
  const isAdminAttendant = userRole === "ADMIN-ATTENDANT";

  // Show generate code button for pharmacist
  const showGenerateCodeButton = isPharmacist && cartItems.length > 0;

  // Show load presale button for attendant
  const showLoadPresaleButton = isAttendant;

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header with fixed height */}
      <header className="w-full h-16 min-h-[4rem] bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <p className="text-xl md:text-2xl font-bold">POS System</p>
          {isPharmacist && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Pharmacist Mode
            </span>
          )}
          {isAttendant && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Attendant Mode
            </span>
          )}
          {isAdminAttendant && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
              Admin Attendant Mode
            </span>
          )}
        </div>

        {/* Load Presale Button for Attendants */}
        {showLoadPresaleButton && (
          <Button
            onClick={() => setShowLoadPresaleModal(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Package className="h-4 w-4 mr-2" />
            Load Presale
          </Button>
        )}
      </header>

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
                {ProductData?.data?.results?.data?.map((product: Product) => {
                  const isOutOfStock =
                    product.quantity === 0 || product.status === "OUT-OF-STOCK";
                  const hasVariations =
                    product.variations && product.variations.length > 0;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`border rounded-lg p-2 md:p-2 transition-shadow duration-300 relative ${
                        isOutOfStock
                          ? "border-gray-200 cursor-not-allowed opacity-50"
                          : "hover:border-green-300 border-gray-200 cursor-pointer group"
                      }`}
                    >
                      {/* Variation Badge */}
                      {hasVariations && !isOutOfStock && (
                        <div className="absolute top-1 right-1 bg-green-600 text-white px-2 py-0.5 rounded-full text-[8px] font-medium z-10">
                          {product?.variations?.length} options
                        </div>
                      )}

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
                          {getProductPriceDisplay(product)}
                        </p>
                        {product.type === "PRODUCT" && (
                          <p
                            className={`text-[8px] px-2 py-1 rounded-full ${getStatusColor(
                              product.status,
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
                      },
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
        <aside className="w-full md:w-[30%] h-full bg-gray-50 p-3 md:p-4 overflow-y-auto border-t md:border-t-0 border-gray-300">
          {cartItems.length > 0 ? (
            <>
              {/* Show Generate Code button for Pharmacist */}
              {showGenerateCodeButton && (
                <div className="mb-4">
                  <Button
                    onClick={() => setShowGeneratePresaleModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Presale Code
                  </Button>
                </div>
              )}

              {/* Show normal checkout for non-pharmacist roles */}
              {!isPharmacist && (
                <CheckoutPage
                  clearCartFunc={clearCartFunc}
                  businessData={businessData} // ADD THIS PROP
                />
              )}

              {/* Show cart items for pharmacist but no checkout */}
              {isPharmacist && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Cart Items ({cartItems.length})
                  </h2>
                  <div className="border-gray-100 shadow-sm rounded-md bg-white overflow-y-auto max-h-[400px]">
                    <div className="space-y-1">
                      {cartItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-3 flex items-center gap-3"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Qty: {item.cartQuantity || 1}</span>
                              <span>•</span>
                              <span>
                                {formatToNaira(
                                  item.selling_price || item.amount,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-green-50 rounded-md">
                    <p className="font-medium">Pharmacist Mode</p>
                    <p className="text-xs mt-1">
                      Generate a presale code to share with an attendant who
                      will complete the payment.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <NoCartItem />
          )}
        </aside>
      </div>

      {/* Modals */}
      <CustomModal
        isOpen={showVariationModal}
        onClose={() => {
          setShowVariationModal(false);
          setSelectedProduct(null);
        }}
        title=""
      >
        <VariationSelectorModal
          isOpen={showVariationModal}
          onClose={() => {
            setShowVariationModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onAddVariations={handleAddVariations}
        />
      </CustomModal>

      <GeneratePresaleCodeModal
        isOpen={showGeneratePresaleModal}
        onClose={() => setShowGeneratePresaleModal(false)}
        cartItems={cartItems}
        clearCart={clearCartFunc}
        removeFromCart={removeFromCart}
        updateCartItemQuantity={updateCartItemQuantity}
      />

      <LoadPresaleModal
        isOpen={showLoadPresaleModal}
        onClose={() => setShowLoadPresaleModal(false)}
        onAddToCart={handleAddPresaleToCart}
      />
    </div>
  );
};

export default Pos;
