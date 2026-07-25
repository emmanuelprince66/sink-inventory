import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useFetchDepartmentsQuery } from "@/api/products/fetch-departments";
import { useCartStore } from "@/lib/store/cart-store";
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
  incrementQuantity,
}: {
  searchInput?: string;
  addToCart?: any;
  setSearchInput?: any;
  cartItems?: any;
  incrementQuantity?: (itemId: string) => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  // POS must always show the latest business profile (email, phone, address,
  // tax_rate, etc.) so receipts and the sales summary reflect recent edits.
  // Override the default 30s staleTime and force a refetch on every mount.
  const {
    data: BusinessData,
    isLoading: BusinessDataLoading,
    refetch,
  } = useFetchBusinessById(business_id, {
    staleTime: 0,
    refetchOnMount: "always",
  });

  const findBusiness = BusinessData?.data;

  // Extract business data for use in components
  const businessData = findBusiness;

  console.log("BusinessData", BusinessData);
  const debouncedSearchTerm = useDebounce(searchInput || "", 500);
  const [page, setPage] = useState(1);
  const [scannedSku, setScannedSku] = useState<string | null>(null);
  const { user } = useUserRole();

  console.log("User in POS Hook:", user);
  const { showToast } = useToast();
  const saleCompleted = useCartStore((state) => state.saleCompleted);

  const processingRef = useRef(false);

  // Memoize the normalized search term to prevent unnecessary re-renders
  const searchTerm = useMemo(() => {
    return debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;
  }, [debouncedSearchTerm]);

  const { notifications, isConnected, clearNotifications, connectionAttempts } =
    useSSENotifications(user?.tokens?.access || "");

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
      limit: 50,
      include_raw_material: "false", // Exclude raw materials from regular search results
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: DepartmentData,
    isLoading: DepartmentDataLoading,
    refetch: refetchDepartments,
    isRefetching: isRefetchingDepartments,
  } = useFetchDepartmentsQuery(business_id, {
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  console.log("DepartmentData", DepartmentData);

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

  // Filter products based on user role, department, and POS visibility
  const allProductsData = useCallback(
    (products: any[]) => {
      if (!products || products.length === 0) return [];

      // First, filter out products hidden from POS
      // const visibleProducts = products.filter(
      //   (product) => !product.raw_material,
      // );

      // const userRole = user?.role;

      // // ADMIN-ATTENDANT: See everything
      // if (userRole === "ADMIN-ATTENDANT") {
      //   return visibleProducts;
      // }

      // // PHARMACIST: See only pharmacy department products
      // if (userRole === "PHARMACIST") {
      //   return visibleProducts.filter((product) => {
      //     const department = product.department?.toLowerCase();
      //     return department === "pharmacy";
      //   });
      // }

      // // ATTENDANT: See everything EXCEPT pharmacy department products
      // if (userRole === "ATTENDANT") {
      //   return visibleProducts.filter((product) => {
      //     const department = product.department?.toLowerCase();
      //     return department !== "pharmacy";
      //   });
      // }

      // Default: Return all visible products (for OWNER or other roles)
      return products;
    },
    [ProductData],
  );

  // Memoized filtered product data
  const filteredProductData = useMemo(() => {
    if (!ProductData?.data?.results?.data) return ProductData;

    const filteredProducts = allProductsData(ProductData.data.results.data);

    return {
      ...ProductData,
      data: {
        ...ProductData.data,
        results: {
          ...ProductData.data.results,
          data: filteredProducts,
        },
      },
    };
  }, [ProductData, allProductsData]);

  // Memoized filtered scanned inventory data
  const filteredScannedInventoryData = useMemo(() => {
    if (!scannedInventoryData?.data?.results?.data) return scannedInventoryData;

    const filteredProducts = allProductsData(
      scannedInventoryData.data.results.data,
    );

    return {
      ...scannedInventoryData,
      data: {
        ...scannedInventoryData.data,
        results: {
          ...scannedInventoryData.data.results,
          data: filteredProducts,
        },
      },
    };
  }, [scannedInventoryData, allProductsData]);

  // Utility function to normalize SKU/Barcode values
  const normalizeCode = useCallback(
    (code: string | number | null | undefined): string => {
      if (!code) return "";
      return String(code).replace(/\.0+$/, "").trim().toLowerCase();
    },
    [],
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
    [normalizeCode],
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

      if (saleCompleted) {
        showToast("Please start a new sale first", "info");
        return;
      }

      // Product already in cart — bump the quantity instead of blocking.
      const productExist = cartItems?.find((item: any) => item.id === cart.id);
      if (productExist) {
        incrementQuantity?.(cart.id);
        return;
      }

      addToCart(cart);
      showToast(`${cart.name} added to cart`, "success");
    },
    [cartItems, addToCart, incrementQuantity, showToast, saleCompleted],
  );

  // Effect to handle when scanned product data is fetched
  useEffect(() => {
    // Prevent duplicate processing within the same effect cycle
    if (processingRef.current || !scannedSku) return;

    if (filteredScannedInventoryData) {
      processingRef.current = true;

      const products = filteredScannedInventoryData.data?.results?.data || [];

      if (products.length === 0) {
        const userRole = user?.role;
        let errorMessage = "Product not found with scanned code";

        // Provide role-specific error messages
        if (userRole === "PHARMACIST") {
          errorMessage = "Product not found or not a pharmacy product";
        } else if (userRole === "ATTENDANT") {
          errorMessage = "Product not found or is a pharmacy product";
        }

        showToast(errorMessage, "error");
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
    filteredScannedInventoryData,
    scannedProductError,
    scannedSku,
    showToast,
    findMatchingProduct,
    handleAddToCart,
    user?.role,
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
    [showToast],
  );

  // Function to manually refetch scanned product (if needed)
  const refetchScannedProductData = useCallback(() => {
    if (scannedSku) {
      refetchScannedProduct();
    }
  }, [scannedSku, refetchScannedProduct]);

  return {
    ProductData: filteredProductData,
    handleScanResult,
    handleAddToCart,
    scannedProductLoading,
    BusinessDataLoading,
    ProductDataLoading,
    page,
    setPage,
    scannedSku,
    refetchScannedProduct: refetchScannedProductData,
    refetchProducts,
    businessData, // Export business data for tax calculation
  };
};
