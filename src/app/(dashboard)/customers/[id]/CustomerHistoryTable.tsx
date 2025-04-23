import React from "react";
import { CustomerHistoryProps } from "../types";
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";
import { CustomTable } from "@/components/app/CutomTable";
import { columns } from "./historyColunm";
const CustomerHistoryTable = ({
  data,
  loading,
}: {
  data: CustomerHistoryProps;
  loading: boolean;
}) => {
  const { handleHistoryRowClick } = useGetCustomerByIdHook();

  return (
    <>
      <CustomTable
        onRowClick={handleHistoryRowClick}
        columns={columns}
        data={data.data}
        loading={loading}
        noDataText="No customers history found" // Updated text
      />
    </>
  );
};

export default CustomerHistoryTable;
