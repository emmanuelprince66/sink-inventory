import { CustomTable } from "@/components/app/CutomTable";
import { useSalesColumns } from "./ProductSoldColumns";
import { SalesHistoryResponse } from "./types";

const USE_DEMO_DATA = true;

const demoData = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    unit_sold: 6,
    vat: 2,
    profit: 100,
    revenue: 600,
    sku: "3333777oos0003--3333",
    discount: 2,
  },
];

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
        data={demoData || response?.data?.results?.data}
      />
    </>
  );
};

export default ProductSoldTable;
