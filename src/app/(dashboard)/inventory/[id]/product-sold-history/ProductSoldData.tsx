import type { ProductTransactionQueryResponse } from "@/api/products/get-transactions-history";
import NoProductSold from "./NoProductSold";
import ProductSoldHistoryTable from "./ProductSoldHistoryTable";

const ProductSoldData = ({
  productSoldData,
  productSoldLoading,
  setPage,
  page,
  pageSize,
  setPageSize,
}: {
  productSoldData: ProductTransactionQueryResponse;
  productSoldLoading: boolean;
  setPage: (page: number) => void;
  page: number;
  pageSize: number;
  setPageSize: (size: number) => void;
}) => {
  const totalPages = productSoldData?.data?.pages || 1;
  return (
    <>
      <div className="w-full mt-3">
        {productSoldData?.data?.results?.data?.length > 0 &&
        !productSoldLoading ? (
          <ProductSoldHistoryTable
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            response={productSoldData}
            loading={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoProductSold />
          </div>
        )}
      </div>
    </>
  );
};

export default ProductSoldData;
