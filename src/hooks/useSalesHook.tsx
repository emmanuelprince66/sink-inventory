import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useFetchOrderHistoryQuery } from "@/api/sales/fetch-order-history";
import { useFetchSalesHistoryQuery } from "@/api/sales/fetch-sales";
import { useReverseSaleMutation } from "@/api/sales/reverse-sale";
import { queryKey } from "@/constants/query-key";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useSelectedOrderStore } from "@/lib/store/useSelectedOrderStore";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

// Define these outside the hook so they're not recreated on every render
const filterMapping = {
  All: "",
  "Fast Moving": "FAST-MOVING",
  "Most Profitable": "MOST-PROFITABLE",
  "Top Selling": "TOP-SELLING",
  Discounted: "DISCOUNTED",
} as const;

const filterMappingTwo = {
  All: "",
  Completed: "COMPLETED",
  Pending: "PENDING",
  Cancelled: "CANCELLED",
} as const;

export const useSalesHook = ({
  activeFilter,
  activeFilterTwo,
  dateRange,
  searchInput,
  attendantId,
  selectedCategoryId,
  page,
  closeModal,
}: {
  activeFilter?: keyof typeof filterMapping;
  activeFilterTwo?: keyof typeof filterMappingTwo;
  dateRange?: DateRange;
  searchInput?: string;
  attendantId?: string;
  selectedCategoryId?: any;
  page?: number;
  closeModal?: () => void;
} = {}) => {
  console.log("daterange", dateRange);
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const queryClient = useQueryClient();
  const router = useRouter();

  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "PRODUCT",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: AttendantsData, isLoading: AttendantsLoading } =
    useFetchAttendants(business_id);

  const { mutate: reverseSale, isPending: ReverseSalePending } =
    useReverseSaleMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
        queryClient.invalidateQueries({
          queryKey: [queryKey.sales.getAllOrdersHistory],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKey.sales.getAllSalesHistory],
        });
        setLoading(false);
        if (closeModal) closeModal();
      },
      onError: (error) => {
        console.error("Error reversing sale:", error);
        setLoading(false);
      },
    });

  const handleReverseSale = (productId: any) => {
    setLoading(true);
    reverseSale(productId);
  };

  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const businessData = useBusinessDataStore((state) => state.businessData);
  const setSelectedOrder = useSelectedOrderStore(
    (state) => state.setSelectedOrder,
  );

  // Order History has no fetch-by-id endpoint (unlike Orders), so the
  // clicked row + current business snapshot are stashed in a persisted
  // store and read back on the dedicated detail page.
  const handleOrderHistoryRowClick = (row: any) => {
    const order = row?.original;
    setSelectedOrder(order, businessData);
    router.push(`/sales/order-history/${order?.id}`);
  };

  const handleProductsRowClick = (row: any) => {
    if (row?.original?.type?.toLowerCase() === "product") {
      router.push(`/inventory/${row?.original?.id}/product-sold-history`);
    }
  };

  // Only pass searchTerm to API when it's empty or at least 3 characters
  const searchTerm =
    !debouncedSearchTerm || debouncedSearchTerm.length === 0
      ? undefined
      : debouncedSearchTerm.length >= 3
        ? debouncedSearchTerm
        : undefined;

  const startDate = dateRange?.from
    ? moment(dateRange.from).format("YYYY-MM-DD")
    : moment().format("YYYY-MM-DD");

  const endDate = dateRange?.to
    ? moment(dateRange.to).format("YYYY-MM-DD")
    : moment().format("YYYY-MM-DD");

  const {
    data: SalesData,
    isLoading: SalesLoading,
    error: SalesError,
    refetch: refetchSales,
  } = useFetchSalesHistoryQuery({
    params: {
      id: business_id,
      attendance_id: attendantId,
      search: searchTerm,
      type: activeFilter && filterMapping[activeFilter],
      start_date: startDate,
      end_date: endDate,
      category_id: selectedCategoryId,
    },
    enabled: !!business_id,
  });

  const {
    data: SalesOrderData,
    isLoading: SalesOrderLoading,
    refetch: refetchOrders,
  } = useFetchOrderHistoryQuery({
    params: {
      id: business_id,
      search: searchTerm,
      page,
      limit: 15,
      status: activeFilterTwo && filterMappingTwo[activeFilterTwo],
      start_date: startDate,
      end_date: endDate,
    },
    enabled: !!business_id,
  });

  // ✅ REMOVED the useEffect that was manually calling refetchSales() and refetchOrders().
  // That was causing a second request with stale/missing params every time a dependency
  // changed (e.g. picking a date). React Query automatically refetches when the params
  // passed to the query change — as long as those params are included in the query key
  // inside useFetchSalesHistoryQuery and useFetchOrderHistoryQuery.
  //
  // ⚠️  Make sure your query keys look like this in the query files:
  //
  //   useFetchSalesHistoryQuery:
  //     queryKey: [queryKey.sales.getAllSalesHistory, params]
  //
  //   useFetchOrderHistoryQuery:
  //     queryKey: [queryKey.sales.getAllOrdersHistory, params]
  //
  // With the full params object in the key, React Query treats every unique combination
  // of filters/dates/search as a separate cache entry and re-fetches automatically.

  return {
    SalesData,
    SalesLoading,
    SalesError,

    handleReverseSale,
    AttendantsData,
    CategoriesDataLoading,
    CategoriesData,
    ReverseSalePending,
    loading,
    page,
    AttendantsLoading,
    handleOrderHistoryRowClick,
    handleProductsRowClick,
    SalesOrderLoading,
    SalesOrderData,
  };
};
