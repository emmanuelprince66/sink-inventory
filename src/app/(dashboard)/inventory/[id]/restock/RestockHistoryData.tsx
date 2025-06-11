import NoRestockData from "./NoRestockData";
import RestockHistoryTable from "./RestockHistoryTable";

const RestockHistoryData = ({
  RestockHistoryData,
  restockHistoryLoading,
}: {
  RestockHistoryData: any;
  restockHistoryLoading: any;
}) => {
  return (
    <>
      <div className="w-full mt-3">
        {RestockHistoryData?.data?.results?.length > 0 &&
        !restockHistoryLoading ? (
          <RestockHistoryTable response={RestockHistoryData} loading={false} />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoRestockData />
          </div>
        )}
      </div>
    </>
  );
};

export default RestockHistoryData;
