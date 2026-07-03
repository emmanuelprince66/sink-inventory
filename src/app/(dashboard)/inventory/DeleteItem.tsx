import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useInventoryHook } from "@/hooks/useInventoryHook";

const DeleteItem = ({
  closeModal,
  text,
  type,
  id,
}: {
  closeModal: () => void;
  id: string;
  text: string;
  type: string;
}) => {
  const { handleDeleteProduct, deleting } = useInventoryHook({
    closeModal,
  });
  return (
    <>
      <div className="w-full flex-col flex items-center justify-center gap-3">
        <p className="text-sm font-medium text-grey-2 text-center">{text}</p>
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
            onClick={() => handleDeleteProduct(id, type)}
            className="cursor-pointer py-2 px-4"
          >
            {deleting ? <Spinner /> : "Confirm"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DeleteItem;
