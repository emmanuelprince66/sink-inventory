import NoOrders from "./NoOrders";
import ProductSoldTable from "./ProductSoldTable";
import { SalesHistoryResponse } from "./types";

const ProductsSold = ({
  SalesData,
  SalesLoading,
  activeFilter,
  setActiveFilter,
  handleProductsRowClick,
  filterOptions,
  searchInput,
  handleSearchChange,
}: {
  SalesData: SalesHistoryResponse;
  SalesLoading: boolean;
  activeFilter: any;
  setActiveFilter: any;
  filterOptions: any;
  handleProductsRowClick: any;
  searchInput: any;
  handleSearchChange: any;
}) => {
  return (
    <>
      {/* search input ends */}

      <div className="w-full mt-3">
        {SalesData?.data?.results?.data?.length > 0 && !SalesLoading ? (
          <ProductSoldTable
            handleProductsRowClick={handleProductsRowClick}
            response={SalesData}
            loading={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoOrders />
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsSold;
