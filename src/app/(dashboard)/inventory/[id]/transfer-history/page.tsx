import TransferHistory from "./TransferHistory";
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <>
      <TransferHistory id={id} />
    </>
  );
};

export default page;
