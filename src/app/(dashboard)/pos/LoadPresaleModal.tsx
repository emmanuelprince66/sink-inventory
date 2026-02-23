"use client";
import { useFetchPresaleQuery } from "@/api/sales/use-presale";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { formatToNaira } from "@/utils/formatMoney";
import { Package, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";

interface LoadPresaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (products: any[]) => void;
}

const LoadPresaleModal: React.FC<LoadPresaleModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [presaleCode, setPresaleCode] = useState("");
  const [fetchEnabled, setFetchEnabled] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const {
    data: presaleResponse,
    isLoading,
    error,
    refetch,
  } = useFetchPresaleQuery(business_id, presaleCode, {
    enabled: fetchEnabled && !!presaleCode,
  });

  // Backend returns: { success: true, data: [...products], message: "..." }
  const responseData = presaleResponse as any;
  const presaleData = responseData;
  const products: any[] = Array.isArray(responseData?.data)
    ? responseData.data
    : responseData?.data?.products || [];

  const handleLoadPresale = () => {
    if (!presaleCode.trim()) {
      showToast("Please enter a presale code", "error");
      return;
    }
    setFetchEnabled(true);
    refetch();
  };

  // Initialize selected products when products are loaded
  useState(() => {
    if (products.length > 0 && selectedProducts.length === 0) {
      setSelectedProducts(products.map((p: any) => ({ ...p })));
    }
  });

  const handleQuantityChange = (productId: string, change: number) => {
    setSelectedProducts((prev) => {
      return prev.map((product) => {
        if (product.id === productId) {
          const newQuantity = (product.quantity || 1) + change;
          if (newQuantity < 1) return product; // Don't go below 1

          const maxQuantity =
            product.stock_quantity || product.available_quantity || 999;
          if (newQuantity > maxQuantity) {
            showToast(
              `Maximum available quantity is ${maxQuantity}`,
              "warning",
            );
            return product;
          }

          return { ...product, quantity: newQuantity };
        }
        return product;
      });
    });
  };

  const handleRemoveProduct = (productId: string, productName: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(`${productName} removed`, "info");
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
    showToast("All products cleared", "info");
  };

  const handleAddAllToCart = () => {
    if (selectedProducts.length === 0) {
      showToast("No products to add", "error");
      return;
    }

    // Map products to cart format
    const productsForCart = selectedProducts.map((product: any) => ({
      ...product,
      cartQuantity: product.quantity || 1,
      // Ensure all required fields are present
      id: product.id,
      name: product.name,
      selling_price: product.selling_price || product.amount || 0,
      amount: product.amount || product.selling_price || 0,
      sku: product.sku || "",
      type: product.type || "PRODUCT",
      status: product.status || "IN-STOCK",
      quantity:
        product.stock_quantity ||
        product.available_quantity ||
        product.quantity ||
        999,
    }));

    onAddToCart(productsForCart);
    showToast(`${productsForCart.length} products added to cart`, "success");

    // Reset and close
    setPresaleCode("");
    setFetchEnabled(false);
    setSelectedProducts([]);
    onClose();
  };

  const handleClose = () => {
    setPresaleCode("");
    setFetchEnabled(false);
    setSelectedProducts([]);
    onClose();
  };

  // Update selectedProducts when products are loaded
  if (products.length > 0 && selectedProducts.length === 0) {
    setSelectedProducts(products.map((p: any) => ({ ...p })));
  }

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} title="Load Presale">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Presale Code</label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Enter presale code"
              className="h-10"
              value={presaleCode}
              onChange={(e) => setPresaleCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLoadPresale();
                }
              }}
            />
            <Button
              onClick={handleLoadPresale}
              disabled={isLoading || !presaleCode.trim()}
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : "Load"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              {(error as any)?.error ||
                (error as any)?.message ||
                "Failed to load presale"}
            </p>
          </div>
        )}

        {presaleData && selectedProducts.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">
                    Presale Found
                  </h3>
                </div>
                {selectedProducts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {selectedProducts.length} product(s) selected
              </p>
            </div>

            <div className="border-gray-100 shadow-sm rounded-md max-h-[350px] overflow-y-auto">
              <div className="divide-y">
                {selectedProducts.map((product: any, index: number) => (
                  <div
                    key={product.id || index}
                    className="p-3 flex items-center gap-3 hover:bg-gray-50"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                          <button
                            onClick={() => handleQuantityChange(product.id, -1)}
                            className="text-gray-600 hover:text-gray-800 text-xs font-bold w-5 h-5 flex items-center justify-center"
                            disabled={product.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="text-xs font-medium min-w-[20px] text-center">
                            {product.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.id, 1)}
                            className="text-gray-600 hover:text-gray-800 text-xs font-bold w-5 h-5 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatToNaira(
                            product.selling_price || product.amount || 0,
                          )}
                        </span>
                      </div>
                      {product.sku && (
                        <p className="text-xs text-gray-400 mt-1">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveProduct(product.id, product.name)
                      }
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAddAllToCart}
              disabled={selectedProducts.length === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add {selectedProducts.length} Product(s) to Cart
            </Button>
          </div>
        )}

        {presaleData &&
          products.length > 0 &&
          selectedProducts.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                All products have been removed. Load a new presale or add
                products back.
              </p>
            </div>
          )}

        {presaleData && products.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Presale found but contains no products
            </p>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default LoadPresaleModal;
