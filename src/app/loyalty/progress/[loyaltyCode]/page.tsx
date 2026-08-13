import type { Metadata } from "next";
import MemberProgress from "../../join/[token]/MemberProgress";

export const metadata: Metadata = {
  title: "Your rewards progress",
  description: "Check how close you are to your next reward.",
};

// Members return here via their loyalty code to check progress without
// re-joining. Public, like the join page.
const LoyaltyProgressPage = async ({
  params,
}: {
  params: Promise<{ loyaltyCode: string }>;
}) => {
  const { loyaltyCode } = await params;

  return (
    <main className="min-h-screen bg-grey-6/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-grey-5 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-grey-1">Your progress</h1>
          <p className="text-sm text-grey-3 mt-1 break-all">
            Code: <span className="font-bold">{loyaltyCode}</span>
          </p>
        </div>
        <MemberProgress loyaltyCode={loyaltyCode} />
      </div>
    </main>
  );
};

export default LoyaltyProgressPage;
