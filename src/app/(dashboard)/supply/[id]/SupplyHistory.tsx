import { Supplier } from "../types";
import NoSupplyHistory from "./NoSupplyHistory";
import SupplyHistoryTable from "./SupplyHistoryTable";

const SupplyHistory = ({
  SupplierByIdData,
  SupplierByIdLoading,
}: {
  SupplierByIdData: Supplier;
  SupplierByIdLoading: boolean;
}) => {
  console.log("SupplierByIdData", SupplierByIdData);
  console.log("SupplierByIdLoading", SupplierByIdLoading);
  if (!SupplierByIdData && SupplierByIdLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center mt-8">
        <NoSupplyHistory />
      </div>
    );
  }
  return (
    <div>
      <div className="w-full h-full ">
        {SupplierByIdData?.supply_history?.length > 0 &&
          !SupplierByIdLoading && (
            <SupplyHistoryTable response={SupplierByIdData} loading={false} />
          )}
      </div>
    </div>
  );
};

export default SupplyHistory;
