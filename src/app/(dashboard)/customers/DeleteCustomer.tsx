"use client";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useCustomerHook } from "@/hooks/useCustomerHook";
const DeleteCustomer = ({
  customer,
  closeModal,
}: {
  customer: any;
  closeModal: () => void;
}) => {
  const { handleDeleteCustomer, deleteCustomerLoading } = useCustomerHook({
    closeModal,
  });

  return (
    <>
      <div className="w-full flex-col flex items-center justify-center gap-3">
        <p className="text-sm">
          Are you sure you want to delete this customer?
        </p>
        <div className="flex gap-3 items-center">
          <Button
            className="bg-red-500 cursor-pointer text-white py-2 px-4 rounded-md"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCustomer(customer)}
            disabled={deleteCustomerLoading}
            className="bg-primary-green-300 text-white cursor-pointer py-2 px-4 rounded-md"
          >
            {deleteCustomerLoading ? <Spinner /> : "Confirm"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DeleteCustomer;
