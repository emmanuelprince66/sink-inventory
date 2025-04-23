import React from "react";
import { CustomerWalletTrxProps } from "../types";
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";
import { CustomTable } from "@/components/app/CutomTable";
import { columns } from "./WalletTrxColunm";

const CustomerWalletTrxTable = ({
  data,
  loading,
}: {
  data: CustomerWalletTrxProps;
  loading: boolean;
}) => {
  const { handleWalletTrxRowClick } = useGetCustomerByIdHook();

  return (
    <>
      <>
        <CustomTable
          onRowClick={handleWalletTrxRowClick}
          columns={columns}
          data={data.data}
          loading={loading}
          noDataText="No wallet transactions found" // Updated text
        />
      </>
    </>
  );
};

export default CustomerWalletTrxTable;
