import { CustomTable } from "@/components/app/CutomTable";
import { useState } from "react";
import { columns } from "./column";
import { SupplierResponse } from "./types";

interface SupplierTableProps {
  response: SupplierResponse;
  loading?: boolean;
  handleRowClick?: (row: any) => void;
}

const SupplierTable = ({
  response,
  loading,
  handleRowClick,
}: SupplierTableProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <>
      <CustomTable
        onRowClick={handleRowClick}
        columns={columns}
        data={response?.data?.results?.data}
        loading={loading}
        noDataText="No Suppliers found" // Updated text
        pagination={{
          currentPage: page,
          totalPages: response?.data?.pages || 1,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            setPage(1); // Reset to first page when page size changes
          },
        }}
      />
    </>
  );
};

export default SupplierTable;
