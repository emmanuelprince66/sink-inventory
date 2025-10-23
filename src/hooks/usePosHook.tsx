import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
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

  console.log("scannedSku in POS Hook:", scannedSku);

  const { notifications, isConnected, clearNotifications, connectionAttempts } =
    useSSENotifications(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MzU0ODcxLCJpYXQiOjE3NTc5MjI4NzEsImp0aSI6Ijg1YmNiNzAyZmFmNzQ1MmRhNmIwOTcwMWFkNGE4NGY1IiwidXNlcl9pZCI6IjY4OGU1OWEzLTFiNTAtNDM3My1hZTEyLWI1MzRkYzNjZWUwYyIsImxvZ2luX3RzIjoiMTc1NzkyMjg3MS4yNDI5NjQifQ.2fHk7xqbCH97SENymevnNBrcfNI_Eesyk3vL47lG8ZU"
    );

  // Main product search query for regular search input
  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

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
      page: 1, // Always use page 1 for scanned products
      limit: 10, // Smaller limit since we're looking for a specific product
      id: business_id,
      search: scannedSku,
    },
    enabled: !!scannedSku && !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log("scannedInventoryData:", scannedInventoryData);

  // Effect to handle when scanned product data is fetched
  useEffect(() => {
    if (scannedInventoryData && scannedSku) {
      const products = scannedInventoryData.data?.results?.data || [];

      // Find the exact product match
      const scannedProduct = products.find(
        (product: any) =>
          product.barcode === scannedSku ||
          product.sku === scannedSku ||
          product.id.toString() === scannedSku
      );

      if (scannedProduct) {
        // Add the scanned product to cart - handleAddToCart will handle all toast messages
        handleAddToCart(scannedProduct);
      } else {
        showToast("Product not found with scanned code", "error");
      }

      // Clear the scanned SKU after processing
      setScannedSku(null);
    }

    if (scannedProductError && scannedSku) {
      showToast("Error searching for product", "error");
      setScannedSku(null);
    }
  }, [scannedInventoryData, scannedProductError, scannedSku, showToast]);

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

    // Set the scanned SKU which will trigger the useGetInventoryQuery
    setScannedSku(scannedCode);
  };

  // Function to manually refetch scanned product (if needed)
  const refetchScannedProductData = () => {
    if (scannedSku) {
      refetchScannedProduct();
    }
  };

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
