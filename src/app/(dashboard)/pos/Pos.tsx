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
import { getFirstProductImage } from "@/utils/productMedia";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Package,
  Star,
} from "lucide-react"; // ADD Star import
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import CartTabs from "./CartTabs";
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
  watchlist?: boolean; // ADD THIS
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
    businessData,
  } = usePosHook({
    searchInput,
    setSearchInput,
    addToCart,
    cartItems,
  });

  const { showToast } = useToast();

  const statusColors: Record<string, string> = {
    "IN-STOCK": "bg-success-2 text-success-1",
    LOW: "bg-warning-2 text-warning-1",
    "OUT-OF-STOCK": "bg-error-2 text-error-1",
    DEFAULT: "bg-grey-6 text-grey-2",
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
      <header className="w-full h-16 min-h-[4rem] bg-white border-b border-grey-5 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <p className="text-xl md:text-2xl font-extrabold text-grey-1">POS System</p>
          {isPharmacist && (
            <span className="text-xs font-bold px-2.5 py-1 bg-secondary-6 text-primary-green-100 rounded-full">
              Pharmacist Mode
            </span>
          )}
          {isAttendant && (
            <span className="text-xs font-bold px-2.5 py-1 bg-secondary-6 text-primary-green-100 rounded-full">
              Attendant Mode
            </span>
          )}
          {isAdminAttendant && (
            <span className="text-xs font-bold px-2.5 py-1 bg-info-2 text-info-1 rounded-full">
              Admin Attendant Mode
            </span>
          )}
        </div>

        {/* Load Presale Button for Attendants */}
        {showLoadPresaleButton && (
          <Button
            onClick={() => setShowLoadPresaleModal(true)}
            variant="outline"
          >
            <Package className="h-4 w-4 mr-2" />
            Load Presale
          </Button>
        )}
      </header>

      {/* Cart Tabs — supports multiple simultaneous sales */}
      <CartTabs />

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Products Section */}
        <main className="w-full md:w-[70%] h-full border-r border-grey-5 p-4 overflow-y-auto">
          <div className="w-full flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
            <h2 className="text-lg md:text-xl font-extrabold text-grey-1">Products</h2>
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
                  <Skeleton className="h-24 md:h-32 w-full rounded-xl bg-grey-6" />
                  <Skeleton className="h-3 md:h-4 w-3/4 bg-grey-6" />
                  <Skeleton className="h-3 md:h-4 w-1/2 bg-grey-6" />
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
                  const isWatchlist = product.watchlist === true; // ADD THIS

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`border rounded-xl p-2 md:p-2 transition-all relative ${
                        isOutOfStock
                          ? "border-grey-5 cursor-not-allowed opacity-50"
                          : "hover:border-primary-green-300 hover:shadow-md border-grey-5 cursor-pointer group"
                      }`}
                    >
                      {/* Watchlist Badge */}
                      {isWatchlist && !isOutOfStock && (
                        <div className="absolute top-1 left-1 bg-error-1 text-white p-1 rounded-full z-10 shadow-md">
                          <Star className="h-3 w-3 fill-white" />
                        </div>
                      )}

                      {/* Variation Badge */}
                      {hasVariations && !isOutOfStock && (
                        <div className="absolute top-1 right-1 bg-primary-green-300 text-white px-2 py-0.5 rounded-full text-[8px] font-bold z-10">
                          {product?.variations?.length} options
                        </div>
                      )}

                      <div className="relative h-20 md:h-32 mb-2 rounded-lg overflow-hidden bg-grey-6">
                        {(() => {
                          const imageSrc = getFirstProductImage(product);
                          return imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={product.name}
                              fill
                              className={`object-cover ${
                                !isOutOfStock &&
                                "group-hover:scale-105 transition-transform duration-300"
                              }`}
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-grey-4">
                              No Image
                            </div>
                          );
                        })()}
                      </div>
                      <h3 className="font-bold text-[8px] md:text-[11px] text-grey-1 truncate">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] md:text-[10px] font-extrabold text-primary-green-300">
                          {getProductPriceDisplay(product)}
                        </p>
                        {product.type === "PRODUCT" && (
                          <p
                            className={`text-[8px] font-bold px-2 py-1 rounded-full ${getStatusColor(
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
        <aside className="w-full md:w-[30%] h-full bg-white p-3 md:p-4 overflow-y-auto border-t md:border-t-0 border-grey-5">
          {cartItems.length > 0 ? (
            <>
              {/* Show Generate Code button for Pharmacist */}
              {showGenerateCodeButton && (
                <div className="mb-4">
                  <Button
                    onClick={() => setShowGeneratePresaleModal(true)}
                    className="w-full"
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
                  businessData={businessData}
                />
              )}

              {/* Show cart items for pharmacist but no checkout */}
              {isPharmacist && (
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-grey-1">
                    Cart Items ({cartItems.length})
                  </h2>
                  <div className="border border-grey-5 shadow-sm rounded-xl bg-white overflow-y-auto max-h-[400px]">
                    <div className="divide-y divide-grey-6">
                      {cartItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-3 flex items-center gap-3"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-sm text-grey-1">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs font-medium text-grey-3">
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
                  <div className="text-sm font-medium text-primary-green-100 p-3 bg-secondary-6 rounded-xl">
                    <p className="font-bold">Pharmacist Mode</p>
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
