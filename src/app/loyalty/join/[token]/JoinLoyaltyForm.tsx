"use client";

import { Spinner } from "@/components/app/Spinner";
import JoinForm from "./parts/JoinForm";
import JoinHero from "./parts/JoinHero";
import JoinHowItWorks from "./parts/JoinHowItWorks";
import JoinSuccessCard from "./parts/JoinSuccessCard";
import { useJoinLoyalty } from "./parts/useJoinLoyalty";

const JoinLoyaltyForm = ({ token }: { token: string }) => {
  const join = useJoinLoyalty(token);
  const { joined, campaign, campaignLoading, streakLength, canGoBack, theme } =
    join;

  if (joined) return <JoinSuccessCard join={join} />;

  // A customer who scans a dead QR must be told so, not shown a
  // working-looking signup form that will fail on submit.
  if (campaignLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-6/40">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-5xl" aria-hidden>
          🔒
        </div>
        <h1 className="text-xl font-extrabold text-grey-1">
          This QR code isn&apos;t active
        </h1>
        <p className="text-sm text-grey-3">
          It may have expired, or the campaign behind it has ended. Ask a member
          of staff for a current code.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-grey-6/40">
      <JoinHero campaign={campaign} canGoBack={canGoBack} theme={theme} />

      {/* Curved cut-out under the hero, as in the design */}
      <div className="-mt-16 h-16 rounded-t-[2.5rem] bg-grey-6/40" />

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <JoinHowItWorks
          campaign={campaign}
          streakLength={streakLength}
          theme={theme}
        />
        <JoinForm join={join} />
      </main>
    </div>
  );
};

export default JoinLoyaltyForm;
