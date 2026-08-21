"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateLoyaltyWizard from "../../growth/wizard/CreateLoyaltyWizard";

const CreateLoyaltyPage = () => {
  const router = useRouter();

  // Both Cancel and "Done — View All Programmes" land back on the Loyalty
  // Programs tab, which is where the new campaign now appears.
  const back = () => router.push("/customers?tab=Loyalty%20Programs");

  return (
    <div className="w-full">
      <button
        onClick={back}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-grey-3 hover:bg-grey-6 hover:text-grey-1 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Loyalty Programmes
      </button>

      <div className="mx-auto mt-3 w-full max-w-2xl rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
        <CreateLoyaltyWizard onDone={back} />
      </div>
    </div>
  );
};

export default CreateLoyaltyPage;
