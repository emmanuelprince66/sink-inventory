import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { useFetchSingleSupplyHook } from "@/hooks/useFetchSingleSupplyHook";
import { Supplier } from "../types";
import { columns } from "./column";
import SupplyHistoryDetails from "./SupplyHistoryDetails";

const SupplyHistoryTable = ({
  response,
  loading,
}: {
  response: Supplier;
  loading?: boolean;
}) => {
  const {
    supplierDetails,
    closeSupplyHistoryDetailsModal,
    showSupplyHistoryDetailsModal,
    handleSupplyHistoryRowClick,
  } = useFetchSingleSupplyHook();

  console.log("show", showSupplyHistoryDetailsModal);
  return (
    <>
      <CustomTable
        onRowClick={handleSupplyHistoryRowClick}
        columns={columns}
        data={response?.supply_history}
        loading={loading}
        noDataText="No Suppliers found" // Updated text
      />

      {/* modal to add supply */}
      <CustomModal
        isOpen={showSupplyHistoryDetailsModal}
        onClose={closeSupplyHistoryDetailsModal}
        trigger={false}
        title="Supplier Details"
      >
        <div className="w-full ">
          <SupplyHistoryDetails supplierDetails={supplierDetails} />
        </div>
      </CustomModal>
    </>
  );
};

export default SupplyHistoryTable;
