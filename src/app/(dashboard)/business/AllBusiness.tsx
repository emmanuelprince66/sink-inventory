"use client";

import CreateBusinessForm from "@/app/create-business/CreateBusinessForm";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessHook } from "@/hooks/useBusinessHook";
import { Plus } from "lucide-react";
import { useState } from "react";
import { BusinessTable } from "./BusinessTable";
import NoBusiness from "./NoBusiness";
import { columns } from "./columns";

const AllBusiness = ({ section }: { section?: string }) => {
  // ── Create modal open/close (local — no async needed) ────────────────────
  const [openCreateBusinessModal, setOpenCreateBusinessModal] = useState(false);
  const closeCreateBusinessModal = () => {
    setOpenCreateBusinessModal(false);
    form.reset(); // clear the shared form when closing create modal
  };
  const openCreateBusinessModalFunc = () => setOpenCreateBusinessModal(true);

  // ── Single hook call — all logic lives here ───────────────────────────────
  const {
    // shared form & options
    form,
    businessTypeOptions,
    currencyOptions,

    // create
    onSubmit,
    loading: isCreating,

    // list
    AllBusinessData,
    AllBusinessLoading,
    handleRowClick,

    // user
    user,

    // edit
    openEditBusinessModal,
    closeEditBusinessModal,
    handleEditClick,
    EditBusinessData,
    EditBusinessLoading,
    onEditSubmit,
    isUpdating,

    // delete
    openDeleteModal,
    closeDeleteModal,
    handleDeleteClick,
    handleConfirmDelete,
    isDeleting,
  } = useBusinessHook({ closeCreateBusinessModal });

  console.log("AllBusinessData:", AllBusinessData);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (AllBusinessLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center mt-8 space-y-6">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-8 w-48 bg-[#eef4ef]" />
          <Skeleton className="h-10 w-32 bg-[#eef4ef]" />
        </div>
        <div className="w-full space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-12 bg-[#eef4ef]" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
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

  const tableColumns = columns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
          My Businesses
        </p>

        {user && user?.role === "OWNER" && (
          <Button
            className="flex items-center py-0 md:py-[25px]"
            onClick={openCreateBusinessModalFunc}
          >
            <Plus className="mr-1" />
            Add Business
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="w-full mt-6">
        <BusinessTable
          data={AllBusinessData}
          columns={tableColumns}
          handleRowClick={section === "start" ? handleRowClick : undefined}
        />
      </div>

      {/* ── Create Business Modal ── */}
      <CustomModal
        isOpen={openCreateBusinessModal}
        onClose={closeCreateBusinessModal}
        trigger={false}
        title="Create Business"
        description="Add a new business to your account"
      >
        <div className="w-full">
          {/* Pass the shared form + create handler */}
          <CreateBusinessForm
            form={form}
            onSubmit={onSubmit}
            businessTypeOptions={businessTypeOptions}
            currencyOptions={currencyOptions}
            loading={isCreating}
            submitLabel="Create Business"
          />
        </div>
      </CustomModal>

      {/* ── Edit Business Modal ── */}
      <CustomModal
        isOpen={openEditBusinessModal}
        onClose={closeEditBusinessModal}
        trigger={false}
        title="Edit Business"
        description="Update your business details"
      >
        <div className="w-full">
          {EditBusinessLoading || !EditBusinessData ? (
            // Skeleton while fetching the business to edit
            <div className="w-full max-w-xl bg-white p-4 rounded shadow-md space-y-4 mx-auto">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-24 bg-[#eef4ef]" />
                <Skeleton className="h-32 w-32 rounded-full bg-[#eef4ef]" />
                <Skeleton className="h-9 w-28 bg-[#eef4ef]" />
              </div>
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-24 bg-[#eef4ef]" />
                  <Skeleton className="h-10 w-full bg-[#eef4ef]" />
                </div>
              ))}
              <Skeleton className="h-12 w-full bg-[#eef4ef]" />
            </div>
          ) : (
            // Pass the same shared form + edit handler
            // form is already pre-populated by the useEffect in useBusinessHook
            <CreateBusinessForm
              form={form}
              onSubmit={onEditSubmit}
              businessTypeOptions={businessTypeOptions}
              currencyOptions={currencyOptions}
              loading={isUpdating}
              submitLabel="Save Changes"
            />
          )}
        </div>
      </CustomModal>

      {/* ── Delete Confirmation Modal ── */}
      <CustomModal
        isOpen={openDeleteModal}
        onClose={closeDeleteModal}
        trigger={false}
        title="Delete Business"
        description="This action cannot be undone."
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-gray-600">
            This will permanently delete the business and all associated data.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Business"}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default AllBusiness;
