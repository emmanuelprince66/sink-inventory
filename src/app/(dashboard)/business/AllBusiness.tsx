"use client";

import React, { ReactNode, useState } from "react";
import NoBusiness from "./NoBusiness"; // Import your NoBusiness component
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBusinessHook } from "@/hooks/useBusinessHook";
import { Spinner } from "@/components/app/Spinner";
import { BusinessTable } from "./BusinessTable";
import { CustomModal } from "@/components/app/CustomModal";
import CreateBusinessForm from "@/app/create-business/CreateBusinessForm";

const AllBusiness = () => {
  const {
    AllBusinessData,
    AllBusinessLoading,
    closeCreateBusinessModal,
    openCreateBusinessModal,
    openCreateBusinessModalFunc,
  } = useBusinessHook();

  if (AllBusinessLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center mt-8">
        <Spinner size={"xLarge"} className="text-primary-green-300" />
      </div>
    );
  }

  if (AllBusinessData?.length === 0) {
    return (
      <NoBusiness openCreateBusinessModalFunc={openCreateBusinessModalFunc} />
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="  text-2xl md:text-3xl text-primary-black-100 font-[500]">
            My Businesses
          </p>
        </div>
        <div className="text-[14px] md:text-[20px]">
          <Button
            className="flex items-center py-0 md:py-[25px]"
            onClick={openCreateBusinessModalFunc}
          >
            <Plus />
            Add Business
          </Button>
        </div>
      </div>

      <div className="w-full mt-6">
        <BusinessTable data={AllBusinessData} />
      </div>

      <CustomModal
        isOpen={openCreateBusinessModal}
        onClose={closeCreateBusinessModal}
        trigger={false}
        title="Create Business"
        description="Add more business "
      >
        <div className="w-full">
          <CreateBusinessForm />
        </div>
      </CustomModal>
    </div>
  );
};

export default AllBusiness;
