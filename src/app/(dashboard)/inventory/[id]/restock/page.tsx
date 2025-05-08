import Restock from "./Restock";
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <>
      <Restock id={id} />
    </>
  );
};

export default page;
