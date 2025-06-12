"use client";

import CreateBusinessForm from "@/app/create-business/CreateBusinessForm";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessHook } from "@/hooks/useBusinessHook";
import { useUserRole } from "@/lib/store/user-store";
import { Plus } from "lucide-react";
import { useState } from "react";
import { BusinessTable } from "./BusinessTable";
import NoBusiness from "./NoBusiness";

const AllBusiness = ({ section }: { section?: string }) => {
  const [openCreateBusinessModal, setOpenCreateBusinessModal] = useState(false);
  const closeCreateBusinessModal = () => setOpenCreateBusinessModal(false);
  const openCreateBusinessModalFunc = () => setOpenCreateBusinessModal(true);
  const { user } = useUserRole();
  const { AllBusinessData, AllBusinessLoading, handleRowClick } =
    useBusinessHook({ closeCreateBusinessModal });

  // Loading state
  if (AllBusinessLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center mt-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-8 w-48 bg-[#eef4ef]" />
          <Skeleton className="h-10 w-32 bg-[#eef4ef]" />
        </div>

        {/* Table skeleton */}
        <div className="w-full space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-12 bg-[#eef4ef]" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!AllBusinessLoading && AllBusinessData?.results?.length === 0) {
    return (
      <NoBusiness
        section={section}
        closeCreateBusinessModal={closeCreateBusinessModal}
        openCreateBusinessModal={openCreateBusinessModal}
        openCreateBusinessModalFunc={openCreateBusinessModalFunc}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            My Businesses
          </p>
        </div>

        {user && user?.role === "OWNER" && (
          <div className="text-[14px] md:text-[20px]">
            <Button
              className="flex items-center py-0 md:py-[25px]"
              onClick={openCreateBusinessModalFunc}
            >
              <Plus />
              Add Business
            </Button>
          </div>
        )}
      </div>

      <div className="w-full mt-6">
        <BusinessTable
          data={AllBusinessData}
          handleRowClick={section === "start" ? handleRowClick : undefined}
        />
      </div>

      <CustomModal
        isOpen={openCreateBusinessModal}
        onClose={closeCreateBusinessModal}
        trigger={false}
        title="Create Business"
        description="Add more business"
      >
        <div className="w-full">
          <CreateBusinessForm
            closeCreateBusinessModal={closeCreateBusinessModal}
          />
        </div>
      </CustomModal>
    </div>
  );
};

export default AllBusiness;
