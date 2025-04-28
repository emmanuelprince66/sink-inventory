import { CustomTable } from "@/components/app/CutomTable";

import { columns } from "./ProductSoldColumns";
import { SalesHistoryResponse } from "./types";

const ProductSoldTable = ({
  response,
  loading,
}: {
  response: SalesHistoryResponse;
  loading?: boolean;
}) => {
  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No customers found"
        columns={columns}
        data={response?.data?.results?.data}
      />
    </>
  );
};

export default ProductSoldTable;
