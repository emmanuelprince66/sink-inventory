import { CustomTable } from "@/components/app/CutomTable";
import React from "react";
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
  return (
    <>
      <CustomTable
        onRowClick={handleRowClick}
        columns={columns}
        data={response?.data?.results?.data}
        loading={loading}
        noDataText="No customers found" // Updated text
      />
    </>
  );
};

export default CustomerTable;
