"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { CustomTable } from "@/components/app/CutomTable";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useBankHook } from "@/hooks/useBankHook";
import { useUserRole } from "@/lib/store/user-store";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddBankForm } from "./AddBankForm";
import { getBankColumns } from "./column";

export const Bank = () => {
  const closeAddBankModal = () => setOpenAddBankModal(false);
  const closeDellBankModal = () => setOpenDelBankModal(false);
  const { user } = useUserRole();

  const { BankData, BankDataLoading, handleDeleteBank, deleteBankLoading } =
    useBankHook({ closeModal: closeDellBankModal });
  const [bankData, setBankData] = useState<any>(null);

  const handleDeleteBankFunc = () => {
    handleDeleteBank(bankData);
  };

  const [openAddBankModal, setOpenAddBankModal] = useState(false);
  const openAddBankModalFunc = () => setOpenAddBankModal(true);

  const [openDelBankModal, setOpenDelBankModal] = useState(false);
  const openDellBankModalFunc = () => setOpenDelBankModal(true);

  console.log("openAddBankModal", openAddBankModal);

  const handleOpenBankDelModal = (bank: any) => {
    setBankData(bank);
    openDellBankModalFunc();
  };

  const canDelete = !!(user && user?.role === "OWNER");
  const columns = getBankColumns({
    canDelete,
    onDelete: handleOpenBankDelModal,
  });

  return (
    <>
      <div className="flex h-full w-full flex-col gap-3 items-start">
        <div className="w-full flex justify-end">
          {user && user?.role === "OWNER" && (
            <Button
              onClick={openAddBankModalFunc}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Bank
            </Button>
          )}
        </div>

        <div className="w-full">
          <CustomTable
            columns={columns}
            data={BankData?.data ?? []}
            loading={BankDataLoading}
            noDataText="No bank accounts found"
            showSerialNumber={false}
            bordered={false}
          />
        </div>
      </div>

      <CustomModal
        isOpen={openAddBankModal}
        onClose={closeAddBankModal}
        trigger={false}
        title="Add Bank"
      >
        <AddBankForm closeModal={closeAddBankModal} />
      </CustomModal>
      <CustomModal
        isOpen={openDelBankModal}
        onClose={closeDellBankModal}
        trigger={false}
        title="Delete Bank"
      >
        <div className="w-full flex-col items-center justify-center gap-3">
          <p className="text-center text-sm font-medium text-grey-2">
            Are you sure you want to delete this bank?
          </p>
          <div className="flex gap-4 mx-auto justify-center w-full mt-3">
            <Button
              variant="destructive"
              disabled={deleteBankLoading}
              onClick={handleDeleteBankFunc}
              className="w-[100px]"
            >
              {deleteBankLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                "Confirm"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={closeDellBankModal}
              className="w-[100px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomModal>
    </>
  );
};
