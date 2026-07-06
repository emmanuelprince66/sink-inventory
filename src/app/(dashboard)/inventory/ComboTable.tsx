import { Combo } from "@/api/combo/fetch-combos";
import { CustomTable } from "@/components/app/CutomTable";
import { Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { comboColumns } from "./ComboColumns";

const ComboTable = ({
  response,
  loading,
  setPage,
  page,
}: {
  response: any;
  loading: boolean;
  setPage: (page: number) => void;
  page: number;
}) => {
  const [pageSize, setPageSize] = useState<number>(response?.data?.limit || 10);
  const [currentPage, setCurrentPage] = useState<number>(page || 1);

  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  const totalPages = response?.data?.pages || 1;
  const rawCombos: Combo[] = response?.data?.results?.data || [];

  // Sort by created_at desc (newest first)
  const combos = useMemo(
    () =>
      [...rawCombos].sort((a, b) => {
        const aDate = new Date(a?.created_at || 0).getTime();
        const bDate = new Date(b?.created_at || 0).getTime();
        return bDate - aDate;
      }),
    [rawCombos],
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setPage(1);
  };

  return (
    <CustomTable
      loading={loading}
      bordered={false}
      columns={comboColumns}
      data={combos}
      noDataText={
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-grey-6 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-grey-4" />
          </div>
          <h3 className="text-lg font-bold text-grey-1 mb-1">
            No combos yet
          </h3>
          <p className="text-grey-3 text-sm">
            Create a combo to bundle multiple products together
          </p>
        </div>
      }
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      }}
    />
  );
};

export default ComboTable;
