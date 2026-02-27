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
        <p className="text-sm">{text}</p>
        <div className="flex gap-3 items-center">
          <Button
            variant={"outline"}
            className=" cursor-pointer text-green-400 py-2 px-4 rounded-md"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteProduct(id, type)}
            // disabled={}
            className="bg-red-500 hover:bg-red-600 border-none text-white cursor-pointer py-2 px-4 rounded-md"
          >
            {deleting ? <Spinner /> : "Confirm"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DeleteItem;
