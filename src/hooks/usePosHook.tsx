import { useCan } from "@/hooks/useCan";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useFetchDepartmentsQuery } from "@/api/products/fetch-departments";
import { useCartStore } from "@/lib/store/cart-store";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";
import { isUnsellable, stockIdOf, withQueuedStock } from "@/utils/stock";
import {
  findProductByCode,
  getStockCorrectedAt,
  mergeCached,
  paginate,
  searchProducts,
  toSearchableProducts,
} from "@/lib/offline/offlineCache";
import { usePosOffline } from "@/lib/offline/offlineMode";
import { useAllowSalesWithoutStock } from "./useAllowSalesWithoutStock";
import { useCachedList } from "./useOfflineCache";
import { useQueuedStock } from "./useQueuedStock";

const PAGE_SIZE = 50;

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
  incrementQuantity?: (
    itemId: string,
    allowOversell?: boolean,
    queued?: number,
  ) => void;
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
  const allowOversell = useAllowSalesWithoutStock();
  const { queuedFor } = useQueuedStock();
  const posOffline = usePosOffline();

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

  // Main product search query for regular search input
  const {
    data: ProductData,
    dataUpdatedAt: productDataUpdatedAt,
    isLoading: ProductDataLoading,
    refetch: refetchProducts,
  } = useGetInventoryQuery({
    params: {
      id: business_id,
      search: searchTerm,
      page,
      limit: PAGE_SIZE,
      include_raw_material: "false", // Exclude raw materials from regular search results
    },
    // Offline the grid reads the saved products below instead.
    enabled: !!business_id && !posOffline,
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
    enabled: !!scannedSku && !!business_id && !posOffline,
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

  /* ---- Offline: the saved product list stands in for search and paging ---- */
  const cachedProducts = useCachedList("products", posOffline);
  const searchableProducts = useMemo(
    () => toSearchableProducts(cachedProducts.items),
    [cachedProducts.items],
  );

  // Nothing saved yet but this page is still in memory (the first background
  // save hadn't finished when the connection went): keep showing it rather than
  // replacing products the cashier can see with a message.
  const offlineTerm = debouncedSearchTerm.trim();
  const keepPageInMemory =
    !cachedProducts.loading &&
    !cachedProducts.items.length &&
    !offlineTerm &&
    Boolean(ProductData?.data?.results?.data?.length);
  const usingSavedProducts = posOffline && !keepPageInMemory;

  const offlineMatches = useMemo(
    () =>
      offlineTerm
        ? searchProducts(searchableProducts, offlineTerm)
        : cachedProducts.items,
    [offlineTerm, searchableProducts, cachedProducts.items],
  );

  const offlineProductData = useMemo(() => {
    const { rows, pages } = paginate(offlineMatches, page, PAGE_SIZE);
    return {
      data: { pages, results: { data: rows } },
    };
  }, [offlineMatches, page]);

  // A narrower search can leave the page number past the end.
  useEffect(() => {
    if (usingSavedProducts && page > offlineProductData.data.pages) {
      setPage(offlineProductData.data.pages);
    }
  }, [usingSavedProducts, page, offlineProductData.data.pages]);

  // Offline, a scan has nothing in flight to wait for.
  useEffect(() => {
    if (posOffline && scannedSku) setScannedSku(null);
  }, [posOffline, scannedSku]);

  // Between full refreshes, keep the saved copy of whatever the grid just
  // fetched current, so stock moved by online sales is right if the connection
  // drops straight after.
  // Only a page newer than the saved stock: one fetched before synced sales
  // were taken off it would put those units back.
  const lastMergedAt = useRef(0);
  useEffect(() => {
    if (posOffline || !business_id) return;
    if (
      productDataUpdatedAt <= lastMergedAt.current ||
      productDataUpdatedAt <= getStockCorrectedAt(business_id)
    ) {
      return;
    }
    const rows = ProductData?.data?.results?.data;
    if (Array.isArray(rows)) {
      lastMergedAt.current = productDataUpdatedAt;
      mergeCached("products", business_id, rows).catch(() => undefined);
    }
  }, [ProductData, productDataUpdatedAt, posOffline, business_id]);

  const findSavedProduct = useCallback(
    (code: string) => findProductByCode(cachedProducts.items, code),
    [cachedProducts.items],
  );

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

  const canSellWatchlist = useCan().can("products", "sell_watchlist", true);

  // Memoized add to cart handler
  const handleAddToCart = useCallback(
    (cart: any) => {
      if (!cart) {
        showToast("Invalid product", "error");
        return;
      }

      // Scanning finds watchlist items too; the grid alone isn't enough.
      if (cart.watchlist === true && !canSellWatchlist) {
        showToast("You don't have permission to sell watchlist items", "error");
        return;
      }

      // Out of stock blocks the sale unless the business sells past zero.
      // Stock here counts what's been sold offline; the cart keeps the server's
      // figure, so `cart` itself goes in unchanged.
      if (
        isUnsellable(
          withQueuedStock(cart, queuedFor(stockIdOf(cart))),
          allowOversell,
        )
      ) {
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
        incrementQuantity?.(cart.id, allowOversell, queuedFor(stockIdOf(cart)));
        return;
      }

      addToCart(cart);
      showToast(`${cart.name} added to cart`, "success");
    },
    [
      cartItems,
      addToCart,
      incrementQuantity,
      showToast,
      saleCompleted,
      allowOversell,
      queuedFor,
    ],
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
    ProductData: usingSavedProducts ? offlineProductData : filteredProductData,
    handleScanResult,
    handleAddToCart,
    scannedProductLoading,
    BusinessDataLoading,
    ProductDataLoading: usingSavedProducts
      ? cachedProducts.loading
      : ProductDataLoading,
    offlineProducts: {
      /** The grid is showing the saved list rather than the server's. */
      active: usingSavedProducts,
      loading: posOffline && cachedProducts.loading,
      /** Nothing has been saved on this device for this business. */
      empty:
        posOffline && !cachedProducts.loading && !cachedProducts.items.length,
      /** The saved list has products, but none match this search. */
      noMatches:
        usingSavedProducts &&
        !cachedProducts.loading &&
        cachedProducts.items.length > 0 &&
        offlineMatches.length === 0,
      term: offlineTerm,
    },
    findSavedProduct,
    page,
    setPage,
    scannedSku,
    refetchScannedProduct: refetchScannedProductData,
    refetchProducts,
    businessData, // Export business data for tax calculation
  };
};
