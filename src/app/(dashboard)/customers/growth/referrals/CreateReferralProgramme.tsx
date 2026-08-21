"use client";

import { useCreateReferralProgrammeMutation } from "@/api/customer-referral";
import ReferralProgrammeForm from "./ReferralProgrammeForm";

const CreateReferralProgramme = ({
  business_id,
  onCreated,
  onCancel,
}: {
  business_id: string;
  onCreated: () => void;
  onCancel: () => void;
}) => {
  const { mutate: create, isPending } = useCreateReferralProgrammeMutation({
    business_id,
    onSuccess: onCreated,
  });

  return (
    <ReferralProgrammeForm
      submitLabel="Create Programme"
      pending={isPending}
      onSubmit={create}
      onCancel={onCancel}
    />
  );
};

export default CreateReferralProgramme;
