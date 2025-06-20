import { CustomTable } from "@/components/app/CutomTable";

import { useProductSoldHistoryColumns } from "./ProductSoldHistoryColumn";
const ProductSoldHistoryTable = ({
  response,
  loading,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  response: any;
  loading: any;
  currentPage: number;
  totalPages: number;

  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  const columns = useProductSoldHistoryColumns();

  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No Product Sold History found"
        columns={columns}
        data={response?.data?.results?.data || []}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          onPageChange,
          onPageSizeChange,
        }}
      />
    </>
  );
};

export default ProductSoldHistoryTable;
