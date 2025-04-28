import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { useSalesHook } from "@/hooks/useSalesHook";
import NoOrders from "./NoOrders";
import OrderHistoryTable from "./OrderHistoryTable";
import { SalesOrderData } from "./types";

const OrderHistory = ({
  SalesOrderData,
  loading,
}: {
  SalesOrderData: SalesOrderData;
  loading: boolean;
}) => {
  const {
    searchInput,
    handleSearchChange,
    activeFilter,
    setActiveFilterTwo,
    filterOptionsTwo,
  } = useSalesHook();

  return (
    <>
      {/* Second filter */}
      <div className="flex gap-3 mt-4 mb-3">
        {filterOptionsTwo.map((filter: any) => (
          <Button
            key={filter}
            className={`px-4 py-2 rounded-md h-14 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
              activeFilter === filter
                ? "bg-primary-green-300 text-white"
                : "bg-primary-green-200 text-primary-black-100"
            }`}
            onClick={() => setActiveFilterTwo(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>
      {/* Second filter end */}
      {/* search input */}
      <div className="w-1/2 mb-4">
        <SearchInput
          placeholder="Search ..."
          value={searchInput}
          onValueChange={handleSearchChange}
        />
        {loading && (
          <div className="mt-1 text-sm text-muted-foreground">Searching...</div>
        )}
        {searchInput.length > 0 && searchInput.length < 3 && (
          <div className="mt-1 text-sm text-muted-foreground">
            Type at least 3 characters to search
          </div>
        )}
      </div>
      {/* search input ends */}

      <div className="w-full mt-3">
        {SalesOrderData?.data?.results?.length > 0 && !loading ? (
          <OrderHistoryTable response={SalesOrderData} loading={false} />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoOrders />
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistory;
