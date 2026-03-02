import { CustomTable } from "@/components/app/CutomTable";
import { useEffect, useState } from "react";
import { columns } from "./InventoryColumns";
import { DetailedInventoryResponse } from "./type";

const InventoryTable = ({
  response,
  loading,
  setPage,
  page,
}: {
  response: DetailedInventoryResponse;
  loading: boolean;
  setPage: (page: number) => void;
  page: number;
}) => {
  const [pageSize, setPageSize] = useState<number>(response?.data?.limit || 15);
  const [currentPage, setCurrentPage] = useState<number>(page || 1);

  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  const totalPages = response?.data?.pages || 1;
  const tableData = response?.data?.results?.data;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setPage(1);
  };

  return (
    <CustomTable
      loading={loading}
      noDataText="No Inventory found"
      columns={columns}
      data={tableData}
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      }}
    />
  );
};

export default InventoryTable;
