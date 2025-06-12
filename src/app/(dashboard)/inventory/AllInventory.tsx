import { useInventoryHook } from "@/hooks/useInventoryHook";
import InventoryTable from "./InventoryTable";
import NoInventory from "./NoInventory";

const AllInventory = ({
  loading,
  setPage,
  page,
}: {
  loading: boolean;
  setPage: any;
  page: any;
}) => {
  const { InventoryData: data } = useInventoryHook({});
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
