import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useComboHook } from "@/hooks/useComboHook";

const DeleteCombo = ({
  closeModal,
  id,
  name,
}: {
  closeModal: () => void;
  id: string;
  name: string;
}) => {
  const { handleDeleteCombo, deletingCombo } = useComboHook({
    closeModal,
  });

  return (
    <div className="w-full flex-col flex items-center justify-center gap-3">
      <p className="text-sm font-medium text-grey-2 text-center">
        Are you sure you want to delete the combo{" "}
        <span className="font-semibold">"{name}"</span>?
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
          onClick={() => handleDeleteCombo(id)}
          disabled={deletingCombo}
          className="cursor-pointer py-2 px-4"
        >
          {deletingCombo ? <Spinner /> : "Confirm"}
        </Button>
      </div>
    </div>
  );
};

export default DeleteCombo;
