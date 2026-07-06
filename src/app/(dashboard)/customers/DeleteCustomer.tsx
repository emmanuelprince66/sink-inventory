"use client";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useCustomerHook } from "@/hooks/useCustomerHook";
const DeleteCustomer = ({
  customer,
  closeModal,
  onDeleted,
}: {
  customer: any;
  closeModal: () => void;
  /** Called after a successful delete, in addition to closeModal (e.g. to navigate away). */
  onDeleted?: () => void;
}) => {
  const handleSuccess = () => {
    closeModal();
    onDeleted?.();
  };

  const { handleDeleteCustomer, deleteCustomerLoading } = useCustomerHook({
    closeModal: handleSuccess,
  });

  return (
    <>
      <div className="w-full flex-col flex items-center justify-center gap-3">
        <p className="text-sm font-medium text-grey-2 text-center">
          Are you sure you want to delete this customer?
        </p>
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            className="cursor-pointer py-2 px-4"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDeleteCustomer(customer)}
            disabled={deleteCustomerLoading}
            className="cursor-pointer py-2 px-4"
          >
            {deleteCustomerLoading ? <Spinner /> : "Confirm"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DeleteCustomer;
