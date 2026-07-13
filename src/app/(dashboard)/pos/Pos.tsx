"use client";

import { CustomModal } from "@/components/app/CustomModal";
import NoCartItem from "@/components/app/NoCartItem";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePosHook } from "@/hooks/usePosHook";
import { useCartStore } from "@/lib/store/cart-store";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { getFirstProductImage } from "@/utils/productMedia";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Package,
  ShoppingCart,
  Star,
} from "lucide-react";
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
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);

  // Below lg (1024px — phones + tablets), the cart doesn't fit as a side
  // column, so it moves into a bottom-sheet triggered by a floating bar.
  const isCompact = useMediaQuery("(max-width: 1023px)");

  const { user } = useUserRole();
  const userRole = user?.role;

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    incrementQuantity,
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
    incrementQuantity,
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

  console.log("total pages", totalPages);

  console.log("product data", ProductData);

  // Determine if user can access presale features
  const isPharmacist = userRole === "PHARMACIST";
  const isAttendant = userRole === "ATTENDANT";
  const isAdminAttendant = userRole === "ADMIN-ATTENDANT";

  // Show generate code button for pharmacist
  const showGenerateCodeButton = isPharmacist && cartItems.length > 0;

  // Show load presale button for attendant
  const showLoadPresaleButton = isAttendant;

  // Rendered once, either inside the desktop/tablet-landscape side column
  // (aside) or inside the mobile bottom-sheet drawer — never both at once,
  // so CheckoutPage's internal state/queries only ever mount a single time.
  const cartPanelContent =
    cartItems.length > 0 ? (
      <>
        {/* Show Generate Code button for Pharmacist */}
        {showGenerateCodeButton && (
          <div className="shrink-0 p-3 md:p-4 pb-0">
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
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="shrink-0 p-3 md:p-4 pb-3">
              <h2 className="text-lg font-extrabold text-grey-1">
                Cart Items ({cartItems.length})
              </h2>
            </div>
            <div className="flex-1 min-h-[180px] overflow-y-auto px-3 md:px-4">
              <div className="border border-grey-5 rounded-xl bg-white overflow-hidden">
                <div className="divide-y divide-grey-6">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="p-3 flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-sm text-grey-1">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-medium text-grey-3">
                          <span>Qty: {item.cartQuantity || 1}</span>
                          <span>•</span>
                          <span>
                            {formatToNaira(item.selling_price || item.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 p-3 md:p-4 pt-3">
              <div className="text-sm font-medium text-primary-green-100 p-3 bg-secondary-6 rounded-xl">
                <p className="font-bold">Pharmacist Mode</p>
                <p className="text-xs mt-1">
                  Generate a presale code to share with an attendant who will
                  complete the payment.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="flex-1 flex items-center justify-center p-4">
        <NoCartItem />
      </div>
    );

  return (
    // Fixed to the viewport minus the dashboard shell's TopBar (64px) + content
    // padding (py-6 = 48px), so the header/tabs stay put and only the product
    // grid and cart items scroll — no page-level scroll to fight with. The
    // product grid and cart items containers each carry their own min-height
    // floor (see below) so they never collapse to invisible on a squeezed
    // viewport (small laptop + browser zoom).
    <div className="w-full h-[calc(100dvh-112px)] grid grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden">
      {/* Header with fixed height */}
      <header className="w-full h-14 min-h-[3.5rem] shrink-0 bg-white border-b border-grey-5 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <p className="text-lg md:text-xl font-extrabold text-grey-1">
            POS System
          </p>
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

      <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-[7fr_3fr] overflow-hidden min-h-0">
        {/* Products Section */}
        <main className="w-full h-full min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden lg:border-r border-grey-5">
          {/* Sticky products header — title, search, scan */}
          <div className="shrink-0 p-4 border-b border-grey-5 bg-white">
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
              <h2 className="text-lg md:text-xl font-extrabold text-grey-1">
                Products
              </h2>
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
          </div>

          {/* Scrollable product grid */}
          <div className="h-full min-h-[220px] overflow-y-auto p-4 pb-[7rem] md:pb-[5rem]">
            {ProductDataLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-24 md:h-32 w-full rounded-xl bg-grey-5" />
                    <Skeleton className="h-3 md:h-4 w-3/4 bg-grey-5" />
                    <Skeleton className="h-3 md:h-4 w-1/2 bg-grey-5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {ProductData?.data?.results?.data?.map((product: Product) => {
                  const isOutOfStock =
                    product.quantity === 0 || product.status === "OUT-OF-STOCK";
                  const hasVariations =
                    product.variations && product.variations.length > 0;
                  const isWatchlist = product.watchlist === true;
                  const isInCart = cartItems.some(
                    (item: any) => item.id === product.id,
                  );

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`border rounded-xl p-2 md:p-2 transition-all relative ${
                        isOutOfStock
                          ? "border-grey-5 cursor-not-allowed opacity-50"
                          : isInCart
                            ? "border-primary-green-300 ring-1 ring-primary-green-300 shadow-sm cursor-pointer group"
                            : "hover:border-primary-green-300 hover:shadow-md border-grey-5 cursor-pointer group"
                      }`}
                    >
                      {/* Watchlist Badge */}
                      {isWatchlist && !isOutOfStock && (
                        <div className="absolute top-1 left-1 bg-error-1 text-white p-1 rounded-full z-10 shadow-md">
                          <Star className="h-3 w-3 fill-white" />
                        </div>
                      )}

                      {/* In-cart checkmark takes priority over the variation-count badge */}
                      {isInCart && !isOutOfStock ? (
                        <div className="absolute top-1 right-1 bg-primary-green-300 text-white p-1 rounded-full z-10 shadow-md">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                      ) : (
                        hasVariations &&
                        !isOutOfStock && (
                          <div className="absolute top-1 right-1 bg-primary-green-300 text-white px-2 py-0.5 rounded-full text-[8px] font-bold z-10">
                            {product?.variations?.length} options
                          </div>
                        )
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

                {!ProductDataLoading && totalPages > 1 && (
                  <div className="col-span-full flex justify-center  items-center py-3 gap-2 border-t border-grey-5 bg-white">
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
              </div>
            )}
          </div>
        </main>
        {/* Floating cart bar — mobile/tablet only, opens the bottom-sheet drawer */}
        {isCompact && cartItems.length > 0 && (
          <div className="shrink-0 border-t border-grey-5 bg-white p-3">
            <button
              type="button"
              onClick={() => setShowCartDrawer(true)}
              className="w-full flex items-center justify-between rounded-xl bg-primary-green-300 text-white px-4 py-3 shadow-md active:scale-[0.99] transition-transform"
            >
              <span className="flex items-center gap-2 font-bold text-sm">
                <ShoppingCart size={18} />
                Cart ({getTotalItems()})
              </span>
              <span className="font-extrabold text-sm">
                {formatToNaira(getTotalPrice())}
              </span>
            </button>
          </div>
        )}

        {/* Cart Sidebar — desktop/tablet-landscape (lg+) only */}
        {!isCompact && (
          <aside className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-white border-grey-5">
            {cartPanelContent}
          </aside>
        )}
      </div>

      {/* Cart bottom-sheet — mobile/tablet only */}
      <Sheet
        open={isCompact && showCartDrawer}
        onOpenChange={setShowCartDrawer}
      >
        <SheetContent
          side="bottom"
          className="h-[92dvh] p-0 gap-0 rounded-t-2xl border-grey-5"
        >
          <SheetTitle className="sr-only">Cart</SheetTitle>
          {cartPanelContent}
        </SheetContent>
      </Sheet>

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
