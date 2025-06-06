import { CustomTable } from "@/components/app/CutomTable";
import { columns } from "./groupsColumn";
const AllGroupsTable = ({
  response,
  loading,
}: {
  response: any;
  loading: any;
}) => {
  return (
    <>
      <>
        <CustomTable
          loading={loading}
          noDataText="No Group found"
          columns={columns}
          data={response?.data}
        />
      </>
    </>
  );
};

export default AllGroupsTable;
