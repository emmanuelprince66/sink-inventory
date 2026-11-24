import { useFetchBankAnalyticBreakdownQuery } from "@/api/analytic/fetch-analytic-breakdown";
import { useFetchTaxAnalyticQuery } from "@/api/analytic/fetch-analytic-tax";
import { useFetchCustomerAnalyticQuery } from "@/api/analytic/fetch-custoner-analytics";
import { useFetchMaxSalesAnalyticQuery } from "@/api/analytic/fetch-max-sale";
import { useFetchProductAnalyticQuery } from "@/api/analytic/fetch-product-analytics";
import { useFetchSalesAnalyticQuery } from "@/api/analytic/fetch-sales-analytic";
import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useCan } from "@/hooks/useCan";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import moment from "moment";

// Without a permissions checklist, these roles see the report tabs.
const REPORT_ROLES = new Set(["OWNER", "ADMIN-ATTENDANT", "ACCOUNTANT"]);
import { DateRange } from "react-day-picker";

export const useAnalyticHook = ({
  attendantId,
  dateRange,
  searchInput,
  openPaymentDetailsModal,
  name,
  selectedYear,
  taxYear,
}: {
  taxYear?: any;
  attendantId?: any;
  selectedYear?: number;
  dateRange?: DateRange | undefined;
  searchInput?: any;
  openPaymentDetailsModal?: boolean;
  name?: string;
}) => {
  console.log("taxYear", taxYear);
  const business_id = useBusinessStore((state) => state.business_id);
  // Product, customer and tax analytics need reports:view on the server;
  // sales:view alone (e.g. an attendant) only gets the Sales tab.
  const { can, role } = useCan();
  const canViewReports = can("reports", "view", REPORT_ROLES.has(role ?? ""));

  const { data: AttendantsData, isLoading: AttendantsLoading } =
    useFetchAttendants(business_id);

  const { data: TaxAnalyticData, isLoading: TaxAnalyticLoading } =
    useFetchTaxAnalyticQuery({
      params: {
        id: business_id,
        year: taxYear,
        start_date: dateRange?.from
          ? moment(dateRange.from).format("YYYY-MM-DD")
          : undefined,
        end_date: dateRange?.to
          ? moment(dateRange.to).format("YYYY-MM-DD")
          : undefined,
      },
      enabled: !!business_id && canViewReports,
    });

  console.log("TaxAnalyticData", TaxAnalyticData);
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

  const { data: MaxSalesAnalyticData, isLoading: MaxSalesAnalyticLoading } =
    useFetchMaxSalesAnalyticQuery({
      params: {
        id: business_id,
        year: String(selectedYear ?? new Date().getFullYear()),
      },
      enabled: !!business_id,
    });

  console.log("MaxSalesAnalyticData", MaxSalesAnalyticData);

  const {
    data: BankBreakDownAnalytics,
    isLoading: BankBreakDownAnalyticsLoading,
  } = useFetchBankAnalyticBreakdownQuery({
    params: {
      id: business_id,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
      name,
    },
    enabled: openPaymentDetailsModal && name !== "" && !!name,
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
      enabled: !!business_id && canViewReports,
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
      enabled: !!business_id && canViewReports,
    });

  return {
    canViewReports,
    SalesAnalyticData,
    AttendantsData,
    CustomerAnalyticData,
    CustomerAnalyticLoading,
    TaxAnalyticData,
    TaxAnalyticLoading,
    AttendantsLoading,
    BankBreakDownAnalytics,
    BankBreakDownAnalyticsLoading,
    ProductAnalyticData,
    ProductAnalyticLoading,
    SalesAnalyticLoading,
    MaxSalesAnalyticData,
    MaxSalesAnalyticLoading,
  };
};
