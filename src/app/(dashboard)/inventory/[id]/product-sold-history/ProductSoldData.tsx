import { useEffect, useState } from "react";
import NoProductSold from "./NoProductSold";
import ProductSoldHistoryTable from "./ProductSoldHistoryTable";

const ProductSoldData = ({
  productSoldData,
  productSoldLoading,
  setPage,
  page,
}: {
  productSoldData: any;
  productSoldLoading: boolean;
  setPage: any;
  page: any;
}) => {
  console.log("ProductSoldData:", productSoldData);
  const [pageSize, setPageSize] = useState<any>(
    productSoldData?.data?.limit || 30
  );
  const [currentPage, setCurrentPage] = useState<number>(page || 1); // Local page state

  // Sync local page state with parent page prop
  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  // Calculate pagination values
  const totalPages = productSoldData?.data?.pages || 1;
  const totalItems = productSoldData?.data?.total || 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage); // Update local state immediately for UI responsiveness
    setPage(newPage); // Update parent state
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    const newPage = 1;
    setCurrentPage(newPage); // Update local state
    setPage(newPage); // Update parent state
  };
  return (
    <>
      <div className="w-full mt-3">
        {productSoldData?.data?.results?.data?.length > 0 &&
        !productSoldLoading ? (
          <ProductSoldHistoryTable
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
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
