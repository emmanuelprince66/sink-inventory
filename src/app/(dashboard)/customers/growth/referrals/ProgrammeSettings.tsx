"use client";

import { useUpdateReferralProgrammeMutation } from "@/api/customer-referral";
import type { CustomerReferralProgramme } from "@/types/customerReferral";
import ReferralProgrammeForm from "./ReferralProgrammeForm";

/**
 * Everything PATCH accepts, in one Save — including the running switch, so
 * pausing is a change you review alongside the rest rather than a write that
 * fires the instant you touch it.
 */
const ProgrammeSettings = ({
  programme,
  onChanged,
  onCancel,
}: {
  programme: CustomerReferralProgramme;
  onChanged: () => void;
  onCancel?: () => void;
}) => {
  const { mutate: updateProgramme, isPending } =
    useUpdateReferralProgrammeMutation({
      programmeId: programme.id,
      onSuccess: onChanged,
    });

  return (
    <ReferralProgrammeForm
      // Seeded from what is saved, not from the create defaults.
      initial={{
        name: programme.name ?? "",
        reward_percentage: String(programme.reward_percentage ?? ""),
        reward_cap: String(programme.reward_cap ?? ""),
        notify_sms: Boolean(programme.notify_sms),
        notify_email: Boolean(programme.notify_email),
        is_active: programme.is_active !== false,
      }}
      includeActive
      submitLabel="Save Changes"
      pending={isPending}
      onSubmit={updateProgramme}
      onCancel={onCancel}
    />
  );
};

export default ProgrammeSettings;
