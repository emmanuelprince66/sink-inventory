import NoTransferHistory from "./NoTransferHistory";
import TransferHistoryTable from "./TransferHistoryTable";

const TransferData = ({
  TransferHistoryData,
  TransferHistoryLoading,
}: {
  TransferHistoryData: any;
  TransferHistoryLoading: any;
}) => {
  return (
    <>
      <div className="w-full mt-3">
        {TransferHistoryData?.data?.results?.length > 0 &&
        !TransferHistoryLoading ? (
          <TransferHistoryTable
            response={TransferHistoryData}
            loading={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoTransferHistory />
          </div>
        )}
      </div>
    </>
  );
};

export default TransferData;
