import { CustomTable } from "@/components/app/CutomTable";
import { useSalesColumns } from "./ProductSoldColumns";
import { SalesHistoryResponse } from "./types";

const ProductSoldTable = ({
  response,
  loading,
  handleProductsRowClick,
}: {
  response: SalesHistoryResponse;
  loading?: boolean;
  handleProductsRowClick: any;
}) => {
  const columns = useSalesColumns(); // Use the hook here

  return (
    <>
      <CustomTable
        onRowClick={handleProductsRowClick}
        loading={loading}
        noDataText="No customers found"
        columns={columns}
        data={response?.data?.results?.data || []}
        bordered={false}
      />
    </>
  );
};

export default ProductSoldTable;
