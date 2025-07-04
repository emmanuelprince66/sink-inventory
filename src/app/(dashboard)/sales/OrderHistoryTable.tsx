import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { useSalesHook } from "@/hooks/useSalesHook";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useEffect, useState } from "react"; // Added useEffect
import { columns } from "./OrderHistoryColumn";
import OrderHistoryDetails from "./OrderHistoryDetails";
import { SalesOrderData } from "./types";

const OrderHistoryTable = ({
  response,
  loading,
  setPage,
  page, // Added page as prop
}: {
  response: SalesOrderData;
  loading?: boolean;
  setPage: (page: number) => void;
  page: number; // Added page prop
}) => {
  const {
    openOrderHistoryModal,
    handleOrderHistoryRowClick,
    closeOpenOrderHistoryModal,
    orderDetails,
  } = useSalesHook();

  const businessData = useBusinessDataStore((state) => state.businessData);

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
        noDataText="No orders found"
        columns={columns}
        data={response?.data?.results || []}
        onRowClick={handleOrderHistoryRowClick}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <CustomModal
        isOpen={openOrderHistoryModal}
        onClose={closeOpenOrderHistoryModal}
        trigger={false}
        title="Order Details"
      >
        <div className="w-full">
          <OrderHistoryDetails
            orderDetails={orderDetails}
            business={businessData}
            closeModal={closeOpenOrderHistoryModal}
          />
        </div>
      </CustomModal>
    </>
  );
};

export default OrderHistoryTable;
