import { columns } from "./columns";
import { CustomTable } from "@/components/app/CutomTable";
import { BusinessResponse } from "./types/types";

interface BusinessTableProps {
  data: BusinessResponse;
  loading?: boolean;
}

export function BusinessTable({ data, loading }: BusinessTableProps) {
  return (
    <CustomTable
      columns={columns}
      data={data.results}
      loading={loading}
      noDataText="No businesses found"
    />
  );
}
