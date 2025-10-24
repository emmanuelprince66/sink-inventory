import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  // Use ref to prevent duplicate processing within the same render cycle
  const processingRef = useRef(false);

  // Memoize the normalized search term to prevent unnecessary re-renders
  const searchTerm = useMemo(() => {
    return debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;
  }, [debouncedSearchTerm]);

  const { notifications, isConnected, clearNotifications, connectionAttempts } =
    useSSENotifications(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MzU0ODcxLCJpYXQiOjE3NTc5MjI4NzEsImp0aSI6Ijg1YmNiNzAyZmFmNzQ1MmRhNmIwOTcwMWFkNGE4NGY1IiwidXNlcl9pZCI6IjY4OGU1OWEzLTFiNTAtNDM3My1hZTEyLWI1MzRkYzNjZWUwYyIsImxvZ2luX3RzIjoiMTc1NzkyMjg3MS4yNDI5NjQifQ.2fHk7xqbCH97SENymevnNBrcfNI_Eesyk3vL47lG8ZU"
    );

  // Main product search query for regular search input
  const {
    data: ProductData,
    isLoading: ProductDataLoading,
    refetch: refetchProducts,
  } = useGetInventoryQuery({
    params: {
      id: business_id,
      search: searchTerm,
      page,
      limit: 20,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Separate query for scanned SKU search
  const {
    data: scannedInventoryData,
    isLoading: scannedProductLoading,
    error: scannedProductError,
    refetch: refetchScannedProduct,
  } = useGetInventoryQuery({
    params: {
      page: 1,
      limit: 10,
      id: business_id,
      search: scannedSku,
    },
    enabled: !!scannedSku && !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  // Utility function to normalize SKU/Barcode values
  const normalizeCode = useCallback(
    (code: string | number | null | undefined): string => {
      if (!code) return "";
      return String(code).replace(/\.0+$/, "").trim().toLowerCase();
    },
    []
  );

  // Memoized function to find matching product
  const findMatchingProduct = useCallback(
    (products: any[], scannedCode: string) => {
      const normalizedScanned = normalizeCode(scannedCode);

      return products.find((product: any) => {
        const normalizedBarcode = normalizeCode(product.barcode);
        const normalizedSku = normalizeCode(product.sku);
        const normalizedId = normalizeCode(product.id);

        return (
          normalizedBarcode === normalizedScanned ||
          normalizedSku === normalizedScanned ||
          normalizedId === normalizedScanned
        );
      });
    },
    [normalizeCode]
  );

  // Memoized add to cart handler
  const handleAddToCart = useCallback(
    (cart: any) => {
      if (!cart) {
        showToast("Invalid product", "error");
        return;
      }

      // Check stock status
      if (cart.quantity === 0 || cart.status === "OUT-OF-STOCK") {
        showToast("This item is out of stock", "error");
        return;
      }

      // Check if product already exists in cart
      const productExist = cartItems?.find((item: any) => item.id === cart.id);

      if (productExist) {
        showToast("Item already in cart", "info");
        return;
      }

      addToCart(cart);
      showToast(`${cart.name} added to cart`, "success");
    },
    [cartItems, addToCart, showToast]
  );

  // Effect to handle when scanned product data is fetched
  useEffect(() => {
    // Prevent duplicate processing within the same effect cycle
    if (processingRef.current || !scannedSku) return;

    if (scannedInventoryData) {
      processingRef.current = true;

      const products = scannedInventoryData.data?.results?.data || [];

      if (products.length === 0) {
        showToast("Product not found with scanned code", "error");
      } else {
        const scannedProduct = findMatchingProduct(products, scannedSku);

        if (scannedProduct) {
          handleAddToCart(scannedProduct);
        } else {
          showToast("Product not found with scanned code", "error");
        }
      }

      // Reset state - allow immediate re-scanning
      setScannedSku(null);
      // Small delay to prevent same-cycle duplicate
      setTimeout(() => {
        processingRef.current = false;
      }, 100);
    }

    if (scannedProductError) {
      showToast("Error searching for product", "error");
      setScannedSku(null);
      processingRef.current = false;
    }
  }, [
    scannedInventoryData,
    scannedProductError,
    scannedSku,
    showToast,
    findMatchingProduct,
    handleAddToCart,
  ]);

  // Optimized scan result handler - allows duplicate scans
  const handleScanResult = useCallback(
    (scannedCode: string) => {
      // Validate scanned code
      const trimmedCode = scannedCode?.trim();

      if (!trimmedCode) {
        showToast("Scanned code is empty", "error");
        return;
      }

      // Only prevent if currently processing (prevents rapid double-scans)
      if (processingRef.current) {
        console.log("Currently processing a scan, please wait");
        return;
      }

      console.log("Processing scanned barcode:", trimmedCode);
      setScannedSku(trimmedCode);
    },
    [showToast]
  );

  // Function to manually refetch scanned product (if needed)
  const refetchScannedProductData = useCallback(() => {
    if (scannedSku) {
      refetchScannedProduct();
    }
  }, [scannedSku, refetchScannedProduct]);

  return {
    ProductData,
    handleScanResult,
    handleAddToCart,
    scannedProductLoading,
    ProductDataLoading,
    page,
    setPage,
    scannedSku,
    refetchScannedProduct: refetchScannedProductData,
    refetchProducts,
  };
};
