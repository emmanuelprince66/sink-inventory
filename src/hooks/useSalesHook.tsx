import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useFetchOrderHistoryQuery } from "@/api/sales/fetch-order-history";
import { useFetchSalesHistoryQuery } from "@/api/sales/fetch-sales";
import { useReverseSaleMutation } from "@/api/sales/reverse-sale";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import moment from "moment";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "./useDebounce";

// Define these outside the hook so they're not recreated on every render
const filterMapping = {
  All: "",
  "Fast Moving": "FAST-MOVING",
  "Most Profitable": "MOST-PROFITABLE",
  "Top Selling": "TOP-SELLING",
} as const;

const filterMappingTwo = {
  All: "",
  Completed: "COMPLETED",
  Pending: "PENDING",
  Cancelled: "CANCELLED",
} as const;

export const useSalesHook = (
  activeFilter?: keyof typeof filterMapping | undefined,
  activeFilterTwo?: keyof typeof filterMappingTwo | undefined,
  dateRange?: DateRange | undefined,
  searchInput?: any,
  attendantId?: any,
  page?: any
) => {
  const business_id = useBusinessStore((state) => state.business_id);

  console.log("business_id", business_id);
  const [productId, setProductId] = useState("");

  const { data: AttendantsData, isLoading: AttendantsLoading } =
    useFetchAttendants(business_id);

  const { mutate: reverseSale, isPending: ReverseSalePending } =
    useReverseSaleMutation({
      onSuccess: (data) => {
        console.log("Sale reversed successfully", data);
      },
      onError: (error, variables, context) => {
        console.error("Error reversing sale:", error);
      },
    });

  const handleReverseSale = (productId: any) => {
    console.log("productId", productId);
    reverseSale(productId);
  };

  console.log("Attendanrs", AttendantsData);
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const [orderDetails, setOrderDetails] = useState<any>({});
  const [openOrderHistoryModal, setOpenOrderHistoryModal] = useState(false);
  const closeOpenOrderHistoryModal = () => setOpenOrderHistoryModal(false);
  const openOrderHistoryModalFunc = () => setOpenOrderHistoryModal(true);

  const handleOrderHistoryRowClick = (row: any) => {
    setOrderDetails(row?.original);
    openOrderHistoryModalFunc();
  };

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
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
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!business_id,
  });

  console.log("SalesOrderData", SalesOrderData);

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
    ReverseSalePending,
    page,
    AttendantsLoading,
    openOrderHistoryModal,
    orderDetails,
    handleOrderHistoryRowClick,
    closeOpenOrderHistoryModal,
    SalesOrderLoading,
    SalesOrderData,
  };
};
