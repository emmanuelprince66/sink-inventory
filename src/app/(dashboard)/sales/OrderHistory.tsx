import { Skeleton } from "@/components/ui/skeleton";
import NoOrders from "./NoOrders";
import OrderHistoryTable from "./OrderHistoryTable";
import { SalesOrderData } from "./types";

interface OrderHistoryProps {
  SalesOrderData: SalesOrderData;
  loading: boolean;
  activeFilter: string;
  setActiveFilter: any;
  filterOptions: readonly string[];
  setPage: any;
  page: any;
}

const OrderHistory = ({
  SalesOrderData,
  setPage,
  filterOptions,
  activeFilter,
  setActiveFilter,
  page,
  loading,
}: OrderHistoryProps) => {
  return (
    <div className="w-full">
      <div className="w-full mt-3">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-[#eef4ef] mt-2" />
            ))}
          </div>
        ) : SalesOrderData?.data?.results?.length > 0 ? (
          <OrderHistoryTable
            setPage={setPage}
            response={SalesOrderData}
            loading={false}
            page={page}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoOrders />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
