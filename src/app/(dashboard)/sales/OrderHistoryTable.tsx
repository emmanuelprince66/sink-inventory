import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { useSalesHook } from "@/hooks/useSalesHook";
import { columns } from "./OrderHistoryColumn";
import OrderHistoryDetails from "./OrderHistoryDetails";
import { SalesOrderData } from "./types";

const OrderHistoryTable = ({
  response,
  loading,
}: {
  response: SalesOrderData;
  loading?: boolean;
}) => {
  const {
    openOrderHistoryModal,
    handleOrderHistoryRowClick,
    closeOpenOrderHistoryModal,
    orderDetails,
  } = useSalesHook();
  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No customers found"
        columns={columns}
        data={response?.data?.results}
        onRowClick={handleOrderHistoryRowClick}
      />

      <CustomModal
        isOpen={openOrderHistoryModal}
        onClose={closeOpenOrderHistoryModal}
        trigger={false}
        title="Order Details"
      >
        <div className="w-full ">
          <OrderHistoryDetails orderDetails={orderDetails} />
        </div>
      </CustomModal>
    </>
  );
};

export default OrderHistoryTable;
