import { CustomTable } from "@/components/app/CutomTable";
import { useTransferHistoryColumns } from "./TransferHistoryColumn";
const TransferHistoryTable = ({
  response,
  loading,
}: {
  response: any;
  loading: any;
}) => {
  const columns = useTransferHistoryColumns();
  return (
    <>
      <>
        <CustomTable
          loading={loading}
          noDataText="No Transfer History found"
          columns={columns}
          data={response?.data?.results}
        />
      </>
    </>
  );
};

export default TransferHistoryTable;
