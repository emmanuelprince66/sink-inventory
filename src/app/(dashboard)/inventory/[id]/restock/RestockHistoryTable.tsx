import { CustomTable } from "@/components/app/CutomTable";
import { useRestockHistoryColumns } from "./RestockHistoryColumn";
const RestockHistoryTable = ({
  response,
  loading,
}: {
  response: any;
  loading: any;
}) => {
  const columns = useRestockHistoryColumns(); // Use the hook here

  return (
    <>
      <>
        <CustomTable
          loading={loading}
          noDataText="No customers found"
          columns={columns}
          data={response?.data?.results}
        />
      </>
    </>
  );
};

export default RestockHistoryTable;
