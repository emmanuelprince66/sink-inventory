import InventoryTable from "./InventoryTable";
import NoInventory from "./NoInventory";
import { DetailedInventoryResponse } from "./type";

const AllInventory = ({
  data,
  loading,
  setPage,
  page,
}: {
  data: DetailedInventoryResponse;
  loading: boolean;
  setPage: any;
  page: any;
}) => {
  return (
    <>
      <div className="w-full mt-3">
        {data?.data?.results?.data?.length > 0 && !loading ? (
          <InventoryTable
            setPage={setPage}
            page={page}
            response={data}
            loading={false}
          />
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
