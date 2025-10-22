import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useFetchProductBySkuQuery } from "@/api/products/fetch-by-sku";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { useEffect, useState } from "react";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";
import { useSSENotifications } from "./useWebSocketNotification";

export const usePosHook = ({
  searchInput,
  setSearchInput,
  addToCart,
  cartItems,
}: {
  searchInput?: string;
  addToCart?: any;
  setSearchInput?: any;
  cartItems?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const debouncedSearchTerm = useDebounce(searchInput || "", 500);
  const [page, setPage] = useState(1);
  const [scannedSku, setScannedSku] = useState<string | null>(null);
  const { user } = useUserRole();
  const { showToast } = useToast();

  const { notifications, isConnected, clearNotifications, connectionAttempts } =
    useSSENotifications(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MzU0ODcxLCJpYXQiOjE3NTc5MjI4NzEsImp0aSI6Ijg1YmNiNzAyZmFmNzQ1MmRhNmIwOTcwMWFkNGE4NGY1IiwidXNlcl9pZCI6IjY4OGU1OWEzLTFiNTAtNDM3My1hZTEyLWI1MzRkYzNjZWUwYyIsImxvZ2luX3RzIjoiMTc1NzkyMjg3MS4yNDI5NjQifQ.2fHk7xqbCH97SENymevnNBrcfNI_Eesyk3vL47lG8ZU"
    );

  // Fetch product by scanned SKU
  const {
    data: scannedProductData,
    isLoading: scannedProductLoading,
    error: scannedProductError,
  } = useFetchProductBySkuQuery(scannedSku, {
    enabled: !!scannedSku,
  });

  // Effect to handle when scanned product data is fetched
  useEffect(() => {
    if (scannedProductData && scannedSku) {
      const product = scannedProductData.data;

      if (product) {
        // Check if product is in stock
        if (product.quantity === 0 || product.status === "OUT-OF-STOCK") {
          showToast(`${product.name} is out of stock`, "error");
        } else {
          // Add the scanned product to cart
          addToCart(product);
          showToast(`${product.name} added to cart`, "success");
        }

        // Clear the scanned SKU after processing
        setScannedSku(null);
      }
    }

    if (scannedProductError && scannedSku) {
      showToast("Product not found with scanned code", "error");
      setScannedSku(null);
    }
  }, [
    scannedProductData,
    scannedProductError,
    scannedSku,
    addToCart,
    showToast,
  ]);

  const handleAddToCart = (cart: any) => {
    if (cart.quantity === 0 || cart.status === "OUT-OF-STOCK") {
      console.error(
        "Cannot add item to cart: Item is out of stock or has 0 quantity"
      );
      showToast("This item is out of stock", "error");
      return;
    }

    const productExist = cartItems?.find((item: any) => item.id === cart.id);

    if (productExist) {
      showToast("Item already in cart", "info");
      return;
    }

    addToCart(cart);
    showToast(`${cart.name} added to cart`, "success");
  };

  const handleScanResult = (scannedCode: string) => {
    console.log("Scanned barcode:", scannedCode);

    if (!scannedCode || scannedCode.trim() === "") {
      showToast("Scanned code is empty", "error");
      return;
    }

    // First, try to find the product by barcode in current results
    const scannedProduct = ProductData?.data?.results?.data?.find(
      (product: any) =>
        product.barcode === scannedCode ||
        product.sku === scannedCode ||
        product.id.toString() === scannedCode
    );

    if (scannedProduct) {
      // Product found in current results, add to cart
      handleAddToCart(scannedProduct);
    } else {
      // Product not found in current results, use SKU query to fetch it
      setScannedSku(scannedCode);
      showToast("Searching for scanned product...", "info");
    }
  };

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

  const { data: ProductData, isLoading: ProductDataLoading } =
    useGetInventoryQuery({
      params: {
        id: business_id,
        search: searchTerm,
        page,
        limit: 20,
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return {
    ProductData,
    handleScanResult,
    handleAddToCart,
    scannedProductLoading,
    ProductDataLoading,
    page,
    setPage,
    scannedSku,
  };
};
