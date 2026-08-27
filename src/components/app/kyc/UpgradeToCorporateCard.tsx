"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase } from "lucide-react";

/**
 * The way out of the individual flow for a merchant who has since registered
 * a company. Deliberately a quiet card at the foot of the sidebar rather than
 * a header action: it is a real option, but not what most people came here to
 * do, and it should not compete with the tier they are filling in.
 */
const UpgradeToCorporateCard = ({ onUpgrade }: { onUpgrade: () => void }) => (
  <div className="rounded-2xl border border-dashed border-grey-5 bg-white p-4">
    <div className="flex items-start gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-grey-6 text-grey-3">
        <Briefcase size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-grey-1">
          Registered a business?
        </p>
        <p className="mt-0.5 text-xs text-grey-3">
          Move to a corporate account for higher limits and settlements in the
          company&apos;s name.
        </p>
      </div>
    </div>

    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onUpgrade}
      className="mt-3 w-full"
    >
      Upgrade to corporate
      <ArrowRight size={14} />
    </Button>
  </div>
);

export default UpgradeToCorporateCard;
