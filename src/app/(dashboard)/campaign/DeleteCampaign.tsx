import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useCampaignHook } from "@/hooks/useCampaignHook";

const DeleteCampaign = ({
  closeModal,
  id,
}: {
  closeModal: () => void;
  id: string;
}) => {
  const { handleDeleteCampaign, deleteCampaignLoading } = useCampaignHook({
    closeModal,
  });
  return (
    <>
      <div className="w-full flex-col flex items-center justify-center gap-3">
        <p className="text-sm">
          Are you sure you want to delete this campaign?
        </p>
        <div className="flex gap-3 items-center">
          <Button
            className="bg-red-500 cursor-pointer text-white py-2 px-4 rounded-md"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCampaign(id)}
            // disabled={}
            className="bg-primary-green-300 text-white cursor-pointer py-2 px-4 rounded-md"
          >
            {deleteCampaignLoading ? <Spinner /> : "Confirm"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DeleteCampaign;
