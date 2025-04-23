import { CustomTable } from "@/components/app/CutomTable";
import React, { useState } from "react";
import { ApiResponse, CustomerResponse, CustomerType } from "./types";
import { columns } from "./columns";

interface CustomerTableProps {
  response: ApiResponse<CustomerResponse>; // Changed from data to response
  loading?: boolean;
  handleRowClick?: (row: any) => void; // Strongly typed
}

const CustomerTable = ({
  response,
  loading,
  handleRowClick,
}: CustomerTableProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <>
      <CustomTable
        onRowClick={handleRowClick}
        columns={columns}
        data={response?.data?.results?.data}
        loading={loading}
        noDataText="No customers found" // Updated text
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

export default CustomerTable;
