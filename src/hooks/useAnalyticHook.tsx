import { useFetchCustomerAnalyticQuery } from "@/api/analytic/fetch-custoner-analytics";
import { useFetchProductAnalyticQuery } from "@/api/analytic/fetch-product-analytics";
import { useFetchSalesAnalyticQuery } from "@/api/analytic/fetch-sales-analytic";
import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import moment from "moment";
import { DateRange } from "react-day-picker";
export const useAnalyticHook = ({
  attendantId,
  dateRange,
  searchInput,
}: {
  attendantId?: any;
  dateRange?: DateRange | undefined;
  searchInput?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: AttendantsData, isLoading: AttendantsLoading } =
    useFetchAttendants(business_id);
  const { data: SalesAnalyticData, isLoading: SalesAnalyticLoading } =
    useFetchSalesAnalyticQuery({
      params: {
        id: business_id,
        attendance_id: attendantId,
        start_date: dateRange?.from
          ? moment(dateRange.from).format("YYYY-MM-DD")
          : undefined,
        end_date: dateRange?.to
          ? moment(dateRange.to).format("YYYY-MM-DD")
          : undefined,
      },
      enabled: !!business_id,
    });
  const { data: ProductAnalyticData, isLoading: ProductAnalyticLoading } =
    useFetchProductAnalyticQuery({
      params: {
        id: business_id,
        start_date: dateRange?.from
          ? moment(dateRange.from).format("YYYY-MM-DD")
          : undefined,
        end_date: dateRange?.to
          ? moment(dateRange.to).format("YYYY-MM-DD")
          : undefined,
      },
      enabled: !!business_id,
    });
  const { data: CustomerAnalyticData, isLoading: CustomerAnalyticLoading } =
    useFetchCustomerAnalyticQuery({
      params: {
        id: business_id,
        start_date: dateRange?.from
          ? moment(dateRange.from).format("YYYY-MM-DD")
          : undefined,
        end_date: dateRange?.to
          ? moment(dateRange.to).format("YYYY-MM-DD")
          : undefined,
      },
      enabled: !!business_id,
    });

  console.log("CustomerAnalyticData", CustomerAnalyticData);
  return {
    SalesAnalyticData,
    AttendantsData,
    CustomerAnalyticData,
    CustomerAnalyticLoading,
    AttendantsLoading,
    ProductAnalyticData,
    ProductAnalyticLoading,
    SalesAnalyticLoading,
  };
};
