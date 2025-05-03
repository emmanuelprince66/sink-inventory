import { CustomTable } from "@/components/app/CutomTable";
import { columns } from "./InventoryColumns";
import { DetailedInventoryResponse } from "./type";
const InventoryTable = ({
  response,
  loading,
}: {
  response: DetailedInventoryResponse;
  loading: boolean;
}) => {
  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No Inventory found"
        columns={columns}
        data={response?.data?.results?.data}
      />
    </>
  );
};

export default InventoryTable;
