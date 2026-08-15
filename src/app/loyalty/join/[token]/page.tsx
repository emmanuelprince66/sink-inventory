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

  // JoinLoyaltyForm owns the full landing page — hero, streak, features and
  // the activation form — so it is rendered without a wrapper card.
  return <JoinLoyaltyForm token={token} />;
};

export default LoyaltyJoinPage;
