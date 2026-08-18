"use client";

import { useUpdateReferralProgrammeMutation } from "@/api/customer-referral";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CustomerReferralProgramme } from "@/types/customerReferral";
import { PauseCircle, PlayCircle } from "lucide-react";
import ReferralProgrammeForm from "./ReferralProgrammeForm";

/**
 * Editing a programme and switching it on or off are the same PATCH, but they
 * are different decisions — pausing is instant and reversible, so it gets its
 * own control above the form rather than being buried in a Save.
 */
const ProgrammeSettings = ({
  programme,
  onChanged,
}: {
  programme: CustomerReferralProgramme;
  onChanged: () => void;
}) => {
  const isActive = programme.is_active !== false;

  const { mutate: updateProgramme, isPending } =
    useUpdateReferralProgrammeMutation({
      programmeId: programme.id,
      onSuccess: onChanged,
    });

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      {/* Running state */}
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
          isActive
            ? "border-primary-green-300/40 bg-primary-green-500"
            : "border-grey-5 bg-grey-6/60",
        )}
      >
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 shrink-0",
              isActive ? "text-primary-green-300" : "text-grey-4",
            )}
          >
            {isActive ? (
              <PlayCircle className="h-5 w-5" />
            ) : (
              <PauseCircle className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-grey-1">
              {isActive ? "Programme is running" : "Programme is paused"}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-grey-3">
              {isActive
                ? "Existing links keep working and new referrals earn rewards."
                : "Links still resolve, but referrals stop earning until you start it again."}
            </p>
          </div>
        </div>

        <Button
          variant={isActive ? "outline" : "default"}
          className="h-10 shrink-0 gap-1.5 rounded-xl text-xs font-bold"
          disabled={isPending}
          onClick={() => updateProgramme({ is_active: !isActive })}
        >
          {isPending ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : isActive ? (
            <PauseCircle className="h-4 w-4" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {isActive ? "Pause Programme" : "Start Programme"}
        </Button>
      </div>

      <div className="border-t border-grey-5 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Programme Details
        </p>
        <p className="mt-1 mb-4 text-[11px] text-grey-3">
          Changes apply to future referrals. Rewards already paid are not
          recalculated.
        </p>

        {/* Seeded from the programme so the form opens on what is saved, not on
            the create defaults. */}
        <ReferralProgrammeForm
          initial={{
            name: programme.name ?? "",
            reward_percentage: String(programme.reward_percentage ?? ""),
            reward_cap: String(programme.reward_cap ?? ""),
            notify_sms: Boolean(programme.notify_sms),
            notify_email: Boolean(programme.notify_email),
          }}
          submitLabel="Save Changes"
          pending={isPending}
          onSubmit={updateProgramme}
        />
      </div>
    </div>
  );
};

export default ProgrammeSettings;
