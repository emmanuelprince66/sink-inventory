import type { Metadata } from "next";
import JoinLoyaltyForm from "./JoinLoyaltyForm";

export const metadata: Metadata = {
  title: "Join rewards programme",
  description: "Join the rewards programme and start earning on every visit.",
};

// Public landing page behind every campaign QR code. Deliberately outside the
// (dashboard) route group so it renders without the app shell, and exempted
// from the auth redirect in middleware.ts.
const LoyaltyJoinPage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-grey-6/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-grey-5 shadow-sm p-6 sm:p-8">
        <JoinLoyaltyForm token={token} />
      </div>
    </main>
  );
};

export default LoyaltyJoinPage;
