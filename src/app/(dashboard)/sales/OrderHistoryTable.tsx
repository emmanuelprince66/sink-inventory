import { CustomTable } from "@/components/app/CutomTable";

import { columns } from "./OrderHistoryColumn";
import { SalesOrderData } from "./types";

const OrderHistoryTable = ({
  response,
  loading,
}: {
  response: SalesOrderData;
  loading?: boolean;
}) => {
  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No customers found"
        columns={columns}
        data={response?.data?.results}
      />
    </>
  );
};

export default OrderHistoryTable;
