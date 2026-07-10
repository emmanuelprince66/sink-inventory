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
          <p className="text-sm font-medium text-grey-2 text-center">
            Are you sure you want to delete this supplier?
          </p>
          <div className="flex gap-3 items-center">
            <Button variant="outline" className="cursor-pointer py-2 px-4" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteSupplier(supplier)}
              disabled={deleteSupplierLoading}
              className="cursor-pointer py-2 px-4"
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
