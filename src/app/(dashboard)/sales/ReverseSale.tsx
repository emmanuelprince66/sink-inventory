"use client";
import { Button } from "@/components/ui/button";

const ReverseSale = ({
  closeReverseModal,
  product,
}: {
  closeReverseModal: () => void;
  product: any;
}) => {
  //   const { handleReverseSale } = useSalesHook();

  return (
    <div className="w-full flex-col flex items-center justify-center gap-3">
      <p className="text-sm font-medium text-grey-2 text-center">
        Are you sure you want to reverse this sale?
      </p>
      <div className="flex gap-3 items-center">
        <Button
          variant="outline"
          className="cursor-pointer py-2 px-4"
          onClick={closeReverseModal}
        >
          Cancel
        </Button>
        <Button variant="destructive" className="cursor-pointer py-2 px-4">
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default ReverseSale;
