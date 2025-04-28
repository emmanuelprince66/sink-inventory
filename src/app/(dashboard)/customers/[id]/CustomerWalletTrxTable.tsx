import React from "react";

import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";

import { CustomerWalletTrxProps } from "../types";

import TrxDetails from "./TrxDetails";
import { columns } from "./WalletTrxColunm";


const CustomerWalletTrxTable = ({
  data,
  loading,
}: {
  data: CustomerWalletTrxProps;
  loading: boolean;
}) => {
  const {
    handleWalletTrxRowClick,
    openWalletTrxDetailsModal,
    closeWalletTrxDetailsModal,
    walletTrxDetails,
  } = useGetCustomerByIdHook();

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

      <CustomModal
        isOpen={openWalletTrxDetailsModal}
        onClose={closeWalletTrxDetailsModal}
        trigger={false}
        title="Transaction Details"
      >
        <div className="w-full ">
          <TrxDetails walletTrxDetails={walletTrxDetails} />
        </div>
      </CustomModal>
    </>
  );
};

export default CustomerWalletTrxTable;
