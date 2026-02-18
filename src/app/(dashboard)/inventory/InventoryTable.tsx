import { CustomTable } from "@/components/app/CutomTable";
import { useEffect, useState } from "react";
import { columns } from "./InventoryColumns";
import { dummyInventoryData } from "./dummyInventory";
import { DetailedInventoryResponse } from "./type";

// ─── Set this to `true` to show demo data to the client ───────────────────────
const USE_DEMO_DATA = true;
// ──────────────────────────────────────────────────────────────────────────────

const InventoryTable = ({
  response,
  loading,
  setPage,
  page,
}: {
  response: DetailedInventoryResponse;
  loading: boolean;
  setPage: (page: number) => void;
  page: number;
}) => {
  const [pageSize, setPageSize] = useState<number>(response?.data?.limit || 15);
  const [currentPage, setCurrentPage] = useState<number>(page || 1);

  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  // ── When demo mode is on, derive pagination from the dummy array ────────────
  const demoTotal = dummyInventoryData.length;
  const demoPages = Math.ceil(demoTotal / pageSize);
  const demoStart = (currentPage - 1) * pageSize;
  const demoSlice = dummyInventoryData.slice(demoStart, demoStart + pageSize);

  // ── Real data (from API) ────────────────────────────────────────────────────
  const totalPages = USE_DEMO_DATA ? demoPages : response?.data?.pages || 1;
  const tableData = USE_DEMO_DATA ? demoSlice : response?.data?.results?.data;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (!USE_DEMO_DATA) setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (!USE_DEMO_DATA) setPage(1);
  };

  return (
    <>
      {USE_DEMO_DATA && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          <span className="font-semibold">Demo Mode:</span> Showing sample
          inventory data for presentation purposes.
        </div>
      )}
      <CustomTable
        loading={USE_DEMO_DATA ? false : loading}
        noDataText="No Inventory found"
        columns={columns}
        data={tableData}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </>
  );
};

export default InventoryTable;
