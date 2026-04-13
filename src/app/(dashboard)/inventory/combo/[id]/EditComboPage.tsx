"use client";

import { Spinner } from "@/components/app/Spinner";
import { useComboHook } from "@/hooks/useComboHook";
import CreateCombo from "../CreateCombo";

const EditComboPage = ({ comboId }: { comboId: string }) => {
  const { singleComboData, singleComboLoading } = useComboHook({ comboId });

  if (singleComboLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <CreateCombo
      isEditMode
      comboId={comboId}
      initialData={singleComboData?.data}
    />
  );
};

export default EditComboPage;
