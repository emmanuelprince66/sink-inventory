import { CustomTable } from "@/components/app/CutomTable";
import { useEffect, useState } from "react";
import { columns } from "./AllExpensesColumn";

const AllExpensesTable = ({
  response,
  loading,
  page,
  setPage,
}: {
  response: any;
  page: number;
  loading: any;
  setPage: (page: number) => void;
}) => {
  // Initialize pageSize with the limit from API response or default to 15
  const [pageSize, setPageSize] = useState<number>(response?.data?.limit || 15);
  const [currentPage, setCurrentPage] = useState<number>(page || 1); // Local page state

  // Sync local page state with parent page prop
  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  // Calculate pagination values
  const totalPages = response?.data?.pages || 1;
  const totalItems = response?.data?.total || 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage); // Update local state immediately for UI responsiveness
    setPage(newPage); // Update parent state
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    const newPage = 1;
    setCurrentPage(newPage); // Update local state
    setPage(newPage); // Update parent state
  };
  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No expenses found"
        columns={columns}
        data={response?.data?.results?.data}
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

export default AllExpensesTable;
