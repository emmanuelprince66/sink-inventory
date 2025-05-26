import { CustomTable } from "@/components/app/CutomTable";
import { columns } from "./AllExpensesColumn";

const AllExpensesTable = ({
  response,
  loading,
}: {
  response: any;
  loading: any;
}) => {
  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No expenses found"
        columns={columns}
        data={response?.data?.results?.data}
      />
    </>
  );
};

export default AllExpensesTable;
