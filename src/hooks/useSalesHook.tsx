import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useFetchOrderHistoryQuery } from "@/api/sales/fetch-order-history";
import { useFetchSalesHistoryQuery } from "@/api/sales/fetch-sales";
import { useReverseSaleMutation } from "@/api/sales/reverse-sale";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const queryClient = useQueryClient();
  const router = useRouter();

  // console.log("business_id", business_id);
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

  console.log("CategoriesData", CategoriesData);

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
        // refetchOrders();
        // refetchSales();

        setLoading(false);

        if (closeModal) closeModal();

        // Optional: Invalidate queries or update cache
      },
      onError: (error) => {
        console.error("Error reversing sale:", error);
        setLoading(false);
      },

      // You can add other callbacks here if needed
    });

  // const { mutate: reverseSale, isPending: ReverseSalePending } =
  //   useReverseSaleMutation({
  //     onSuccess: (data) => {
  //       setLoading(false);
  //       console.log("Sale reversed successfully", data);
  //     },
  //     onError: (error, variables, context) => {
  //       setLoading(false);

  //       console.error("Error reversing sale:", error);
  //     },
  //   });

  const handleReverseSale = (productId: any) => {
    // console.log("productId", productId);
    setLoading(true);
    reverseSale(productId);
  };

  // console.log("Attendanrs", AttendantsData);
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const [orderDetails, setOrderDetails] = useState<any>({});
  const [openOrderHistoryModal, setOpenOrderHistoryModal] = useState(false);
  const closeOpenOrderHistoryModal = () => setOpenOrderHistoryModal(false);
  const openOrderHistoryModalFunc = () => setOpenOrderHistoryModal(true);

  const handleOrderHistoryRowClick = (row: any) => {
    setOrderDetails(row?.original);
    openOrderHistoryModalFunc();
  };
  const handleProductsRowClick = (row: any) => {
    if (row?.original?.type?.toLowerCase() === "product") {
      console.log("row", row.original);

      router.push(`/inventory/${row?.original?.id}/product-sold-history`);
    }
  };

  const searchTerm =
    debouncedSearchTerm?.length || 0 >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

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
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
      category_id: selectedCategoryId,
    },
    enabled: !!business_id,
  });

  console.log("selectedCategoryId", selectedCategoryId);

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
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!business_id,
  });

  // console.log("SalesOrderData", SalesOrderData);

  // Refetch when any critical parameter changes
  useEffect(() => {
    refetchSales();
    refetchOrders();
  }, [
    activeFilter,
    activeFilterTwo,
    dateRange,
    searchTerm,
    refetchSales,
    refetchOrders,
    attendantId,
  ]);

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
    openOrderHistoryModal,
    orderDetails,
    handleOrderHistoryRowClick,
    handleProductsRowClick,
    closeOpenOrderHistoryModal,
    SalesOrderLoading,
    SalesOrderData,
  };
};
