import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useSupplyHook } from "@/hooks/useSupplyHook";

const DeleteSupplier = ({
  closeModal,
  supplier,
}: {
  closeModal: () => void;
  supplier: any;
}) => {
  console.log("suppluer", supplier);

  const { handleDeleteSupplier, deleteSupplierLoading } = useSupplyHook({
    closeModal,
  });
  return (
    <>
      <>
        <div className="w-full flex-col flex items-center justify-center gap-3">
          <p className="text-sm">
            Are you sure you want to delete this supplier?
          </p>
          <div className="flex gap-3 items-center">
            <Button
              className="bg-red-500 cursor-pointer text-white py-2 px-4 rounded-md"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteSupplier(supplier)}
              disabled={deleteSupplierLoading}
              className="bg-primary-green-300 text-white cursor-pointer py-2 px-4 rounded-md"
            >
              {deleteSupplierLoading ? <Spinner /> : "Confirm"}
            </Button>
          </div>
        </div>
      </>
    </>
  );
};

export default DeleteSupplier;
