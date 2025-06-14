import { CustomTable } from "@/components/app/CutomTable";

import { useProductSoldHistoryColumns } from "./ProductSoldHistoryColumn";
const ProductSoldHistoryTable = ({
  response,
  loading,
}: {
  response: any;
  loading: any;
}) => {
  const columns = useProductSoldHistoryColumns();

  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No Product Sold History found"
        columns={columns}
        data={response}
      />
    </>
  );
};

export default ProductSoldHistoryTable;
