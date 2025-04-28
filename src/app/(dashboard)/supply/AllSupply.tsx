import NoSupply from "./NoSupply";
import SupplierTable from "./SupplierTable";
import { SupplierResponse } from "./types";

const AllSupply = ({
  SupplierData,
  handleRowClick,
  SupplierLoading,
}: {
  SupplierData: SupplierResponse;
  SupplierLoading: boolean;
  handleRowClick?: (row: any) => void;
}) => {
  if (!SupplierData && SupplierLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center mt-8">
        <NoSupply />
      </div>
    );
  }
  return (
    <div className="w-full h-full ">
      {SupplierData?.data?.results?.data?.length > 0 && !SupplierLoading && (
        <SupplierTable
          response={SupplierData}
          loading={false}
          handleRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default AllSupply;
