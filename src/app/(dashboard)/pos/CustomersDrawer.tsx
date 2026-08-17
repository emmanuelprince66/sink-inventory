"use client";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckoutHook } from "@/hooks/useCheckoutHook";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AddCustomer from "../customers/AddCustomer";

const CustomerDrawer = ({
  open,
  onOpenChange,
  onCustomerSelect,
  onShippingSelect,
  onViewLoyalty,
}: any) => {
  const [searchInput, setSearchInput] = useState("");

  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);

  const closeOpenCustomerModal = () => setOpenAddCustomerModal(false);
  const openCustomerModalFunc = () => setOpenAddCustomerModal(true);
  const [page, setPage] = useState<number>(1);
  const { CustomerData, CustomerLoading } = useCheckoutHook({
    searchInput,
    page,
  }); // Pass 'page' to the hook

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page on new search
  };

  const handleSelectCustomer = (customer: any) => {
    onCustomerSelect(customer);
    onOpenChange(false); // Close the drawer after selection
  };

  // Initialize pageSize with the limit from API response or default to 15
  const [pageSize, setPageSize] = useState<number>(
    CustomerData?.data?.limit || 15
  );
  const [currentPage, setCurrentPage] = useState<number>(page || 1); // Local page state

  // Sync local page state with parent page prop
  useEffect(() => {
    setCurrentPage(page || 1);
  }, [page]);

  // Calculate pagination values
  const totalPages = CustomerData?.data?.pages || 1;
  const totalItems = CustomerData?.data?.total || 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage); // Update local state immediately for UI responsiveness
      setPage(newPage); // Update parent state (which will trigger re-fetch in useCheckoutHook)
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    const newPage = 1;
    setCurrentPage(newPage); // Update local state
    setPage(newPage); // Update parent state
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-white border border-gray-200 flex flex-col">
          {" "}
          {/* Added flex-col */}
          <SheetHeader>
            <SheetTitle>Select Customer</SheetTitle>
            <SheetDescription>
              Choose an existing customer or create a new one
            </SheetDescription>
          </SheetHeader>
          <div className="p-2">
            <SearchInput
              placeholder="Search customers ..."
              value={searchInput}
              onValueChange={handleSearchChange}
            />
          </div>
          <div className="w-full p-2">
            <Button className="w-full h-12" onClick={openCustomerModalFunc}>
              <Plus />
              Create Customer
            </Button>
          </div>
          <div className="mt-2 space-y-4 flex-grow overflow-y-auto w-full">
            {" "}
            {/* Added flex-grow and overflow-y-auto */}
            {CustomerLoading ? (
              // Show skeleton loading states
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-3 space-y-2">
                  <Skeleton className="bg-grey-5 h-6 w-3/4" />
                  <Skeleton className="bg-grey-5 h-4 w-1/2" />
                </div>
              ))
            ) : CustomerData?.data?.results?.data?.length > 0 ? (
              // Show actual customer data when loaded
              CustomerData.data.results.data.map((customer: any) => (
                <div
                  key={customer.id}
                  className="m-2 rounded-lg border border-gray-200 p-3 transition-colors hover:border-[#52b661]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{customer.name}</h3>
                      <p className="truncate text-sm text-gray-500">
                        {customer.phone || "No phone"}
                        {customer.email ? ` · ${customer.email}` : ""}
                      </p>
                    </div>
                    {customer.tier_name && (
                      <span className="shrink-0 rounded-full bg-primary-green-500 px-2 py-0.5 text-[10px] font-bold text-primary-green-300">
                        {customer.tier_name}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-9 rounded-lg text-xs"
                      onClick={() => onViewLoyalty(customer)}
                    >
                      View Loyalty
                    </Button>
                    <Button
                      className="h-9 rounded-lg text-xs"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      Add to Sale
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4">
                No customers found
              </div>
            )}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-2 border-t border-gray-200 mt-auto">
              {" "}
              {/* Added mt-auto to push to bottom */}
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || CustomerLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || CustomerLoading}
              >
                Next
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CustomModal
        isOpen={openAddCustomerModal}
        onClose={closeOpenCustomerModal}
        trigger={false}
        title="Create Customer"
      >
        <div className="w-full ">
          <AddCustomer closeOpenCustomerModal={closeOpenCustomerModal} />
        </div>
      </CustomModal>
    </>
  );
};

export default CustomerDrawer;
