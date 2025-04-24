import React from "react";
import { CustomerHistoryProps } from "../types";
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";
import { CustomTable } from "@/components/app/CutomTable";
import { columns } from "./historyColunm";
import { CustomModal } from "@/components/app/CustomModal";
import HistoryMoreDetails from "./HistoryMoreDetails";

const CustomerHistoryTable = ({
  data,
  loading,
}: {
  data: CustomerHistoryProps;
  loading: boolean;
}) => {
  const {
    handleHistoryRowClick,
    historyDetailsData,
    openHistoryDetailsModal,
    closeHistoryDetailsModal,
  } = useGetCustomerByIdHook();

  return (
    <>
      <CustomTable
        onRowClick={handleHistoryRowClick}
        columns={columns}
        data={data.data}
        loading={loading}
        noDataText="No customers history found" // Updated text
      />

      {/* modal to add supply */}
      <CustomModal
        isOpen={openHistoryDetailsModal}
        onClose={closeHistoryDetailsModal}
        trigger={false}
        title="Order Details"
      >
        <div className="w-full ">
          <HistoryMoreDetails historyDetailsData={historyDetailsData} />
        </div>
      </CustomModal>
    </>
  );
};

export default CustomerHistoryTable;
