import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CustomModal } from "@/components/app/CustomModal";
import CreateBusinessForm from "@/app/create-business/CreateBusinessForm";

const NoBusiness = ({
  openCreateBusinessModalFunc,
  section,
  closeCreateBusinessModal,
  openCreateBusinessModal,
}: {
  openCreateBusinessModalFunc: () => void;
  closeCreateBusinessModal: () => void;
  openCreateBusinessModal: boolean;
  section?: string;
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

      {section === "start" && (
        <Link href={"/overview"}>
          <p className={"hover:text-primary-green-300 mt-4 text-sm"}>
            I will do this later
          </p>
        </Link>
      )}

      <CustomModal
        isOpen={openCreateBusinessModal}
        onClose={closeCreateBusinessModal}
        trigger={false}
        title="Create Business"
        description="Add more business "
      >
        <div className="w-full">
          <CreateBusinessForm />
        </div>
      </CustomModal>
    </div>
  );
};

export default NoBusiness;
