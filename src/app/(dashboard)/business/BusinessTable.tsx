import { CustomTable } from "@/components/app/CutomTable";
import { ColumnDef } from "@tanstack/react-table";
import { BusinessResponse, BusinessType } from "./types/types";

interface BusinessTableProps {
  data: BusinessResponse;
  columns: ColumnDef<BusinessType>[];
  loading?: boolean;
  handleRowClick?: (row: any) => void;
}

export function BusinessTable({
  data,
  columns,
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
