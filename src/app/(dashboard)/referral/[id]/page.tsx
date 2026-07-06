import ReferralDetail from "./ReferralDetail";

const Page = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <ReferralDetail id={id} />;
};

export default Page;
