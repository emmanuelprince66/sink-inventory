import InventoryTable from "./InventoryTable";
import NoInventory from "./NoInventory";
import { DetailedInventoryResponse } from "./type";

const AllInventory = ({
  data,
  loading,
}: {
  data: DetailedInventoryResponse;
  loading: boolean;
}) => {
  console.log("AllInventory", data);
  return (
    <>
      <div className="w-full mt-3">
        {data?.data?.results?.data?.length > 0 && !loading ? (
          <InventoryTable response={data} loading={false} />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoInventory />
          </div>
        )}
      </div>
    </>
  );
};

export default AllInventory;
