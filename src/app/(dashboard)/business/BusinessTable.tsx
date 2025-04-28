import { CustomTable } from "@/components/app/CutomTable";

import { columns } from "./columns";
import { BusinessResponse } from "./types/types";

interface BusinessTableProps {
  data: BusinessResponse;
  loading?: boolean;
  handleRowClick?: (row: any) => void; // Define the type of row if possible
}

export function BusinessTable({
  data,
  loading,
  handleRowClick,
}: BusinessTableProps) {
  return (
    <CustomTable
      onRowClick={handleRowClick}
      columns={columns}
      data={data.results}
      loading={loading}
      noDataText="No businesses found"
    />
  );
}
