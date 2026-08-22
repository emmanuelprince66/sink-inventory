import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";

import { CustomerHistoryProps } from "../types";

import { columns } from "./historyColunm";
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
  } = useGetCustomerByIdHook({});

  return (
    <>
      <CustomTable
        bordered={false}
        onRowClick={handleHistoryRowClick}
        columns={columns}
        data={data.data}
        loading={loading}
        noDataText="No purchase history found"
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
