import type { Metadata } from "next";
import ReferralProgrammePage from "./ReferralProgrammePage";

export const metadata: Metadata = {
  title: "Referral programme",
};

// A page rather than a modal: the participant list is a working surface with
// its own search, and every programme now has a URL worth linking to.
const Page = async ({
  params,
}: {
  params: Promise<{ programmeId: string }>;
}) => {
  const { programmeId } = await params;
  return <ReferralProgrammePage programmeId={programmeId} />;
};

export default Page;
