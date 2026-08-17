"use client";

import { Plus, Store, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";

// Mobile: two per row at equal width — four pills on one line at 360px left
// each of them a few characters wide. From sm they sit inline at natural size.
const ACTION_CLASS =
  "flex h-10 items-center justify-center gap-1.5 px-3.5 rounded-full text-sm font-bold cursor-pointer whitespace-nowrap";

const LoyaltyProgramsHeader = ({
  onOpenTiers,
  onOpenMembers,
}: {
  onOpenTiers: () => void;
  onOpenMembers: () => void;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-sm text-grey-3 max-w-md">
        Build unlimited loyalty campaigns. Reward customers for visits, spend,
        referrals, and more.
      </p>
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:shrink-0">
        {/* A page, not a modal — nine steps plus the QR handover needs the
            room, and it gets its own URL. */}
        <button
          onClick={() => router.push("/customers/loyalty/create")}
          className={`${ACTION_CLASS} bg-primary-green-100 text-white hover:bg-primary-green-100/90`}
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
        <button
          onClick={onOpenTiers}
          className={`${ACTION_CLASS} border border-grey-5 bg-white text-grey-1 hover:bg-grey-6`}
        >
          <Trophy className="w-4 h-4" />
          Tiers
        </button>
        <button
          onClick={onOpenMembers}
          className={`${ACTION_CLASS} border border-grey-5 bg-white text-grey-1 hover:bg-grey-6`}
        >
          <Users className="w-4 h-4" />
          Members
        </button>
        <button
          onClick={() => router.push("/pos")}
          className={`${ACTION_CLASS} bg-primary-green-300 text-white hover:bg-primary-green-300/90`}
        >
          <Store className="w-4 h-4" />
          Point of Sale
        </button>
      </div>
    </div>
  );
};

export default LoyaltyProgramsHeader;
