import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const NoBusiness = ({
  openCreateBusinessModalFunc,
}: {
  openCreateBusinessModalFunc: () => void;
}) => {
  return (
    <div className="flex flex-col  items-center h-[60vh] justify-center w-full gap-4 text-center ">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-[#1e1e1e]">
          You haven't added any businesses yet.
        </h2>
        <p className="text-gray-400">
          Get started by adding your first business. It's quick and easy!
        </p>
      </div>

      <Button
        className="flex items-center gap-2 py-0 md:py-[20px]"
        onClick={openCreateBusinessModalFunc}
      >
        <Plus className="h-4 w-4" />
        <span>Add Business</span>
      </Button>
    </div>
  );
};

export default NoBusiness;
