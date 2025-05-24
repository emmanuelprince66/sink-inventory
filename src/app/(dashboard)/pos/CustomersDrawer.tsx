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
import { Skeleton } from "@/components/ui/skeleton"; // Make sure to import Skeleton
import { useCheckoutHook } from "@/hooks/useCheckoutHook";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddCustomer from "../customers/AddCustomer";

const CustomerDrawer = ({ open, onOpenChange, onCustomerSelect }: any) => {
  const [searchInput, setSearchInput] = useState("");

  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);

  const closeOpenCustomerModal = () => setOpenAddCustomerModal(false);
  const openCustomerModalFunc = () => setOpenAddCustomerModal(true);

  const { CustomerData, CustomerLoading } = useCheckoutHook({ searchInput });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSelectCustomer = (customer: any) => {
    onCustomerSelect(customer);
    onOpenChange(false); // Close the drawer after selection
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-white border border-gray-200">
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

          <div className="mt-2 space-y-4">
            {CustomerLoading ? (
              // Show skeleton loading states
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-3 space-y-2">
                  <Skeleton className="bg-[#eef4ef] h-6 w-3/4" />
                  <Skeleton className="bg-[#eef4ef] h-4 w-1/2" />
                </div>
              ))
            ) : CustomerData?.data?.results?.data?.length > 0 ? (
              // Show actual customer data when loaded
              CustomerData.data.results.data.map((customer: any) => (
                <div
                  key={customer.id}
                  className="m-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-gray-200 hover:border-[#52b661] transition-colors"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <h3 className="font-medium">{customer.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                    <p className="text-sm text-gray-500">-</p>

                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div>No customers found</div>
            )}

            <div className="w-full p-2">
              <Button className="w-full h-12" onClick={openCustomerModalFunc}>
                <Plus />
                Add Customer
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CustomModal
        isOpen={openAddCustomerModal}
        onClose={closeOpenCustomerModal}
        trigger={false}
        title="Add Customer"
      >
        <div className="w-full ">
          <AddCustomer closeOpenCustomerModal={closeOpenCustomerModal} />
        </div>
      </CustomModal>
    </>
  );
};

export default CustomerDrawer;
