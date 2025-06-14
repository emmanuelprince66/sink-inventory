"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBankHook } from "@/hooks/useBankHook";
import { useUserRole } from "@/lib/store/user-store";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { AddBankForm } from "./AddBankForm";

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

  return (
    <>
      <div className="flex h-full w-full mt-4 flex-col gap-3 items-center justify-center p-4">
        <div className="w-full flex justify-end">
          {user && user?.role === "OWNER" && (
            <Button onClick={openAddBankModalFunc}>Add Bank</Button>
          )}
        </div>
        {BankDataLoading ? (
          <div className="w-full  space-y-2">
            {[1, 2].map((item) => (
              <Skeleton key={item} className="h-12 w-full bg-[#eef4ef]" />
            ))}
          </div>
        ) : (
          <div className="w-full  overflow-hidden rounded-lg ">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Bank Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {BankData?.data?.map((bank: any) => (
                  <tr key={bank.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {bank.bank_name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {bank.account_name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {bank.account_number}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {bank.min_fee || bank.percentage
                          ? `${bank.min_fee ? `Min: ${bank.min_fee}` : ""} ${
                              bank.percentage
                                ? `Percentage: ${bank.percentage}%`
                                : ""
                            }`
                          : "N/A"}
                      </div>
                    </td>
                    {user && user?.role === "OWNER" && (
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          onClick={() => handleOpenBankDelModal(bank)}
                          className="rounded p-1 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomModal
        isOpen={openAddBankModal} // FIXED: Removed the negation
        onClose={closeAddBankModal}
        trigger={false}
        title="Add Bank"
      >
        <AddBankForm closeModal={closeAddBankModal} />
      </CustomModal>
      <CustomModal
        isOpen={openDelBankModal} // FIXED: Removed the negati justify-center w-full mt-3">on
        onClose={closeDellBankModal}
        trigger={false}
        title="Delete Bank"
      >
        <div className="w-full flex-col items-center justify-center gap-3">
          <p className="text-center text-gray-700">
            Are you sure you want to delete this bank?
          </p>
          <div className="flex gap-4 mx-auto justify-center w-full mt-3">
            <Button
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
