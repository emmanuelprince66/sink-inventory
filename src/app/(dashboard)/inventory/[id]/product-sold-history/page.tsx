import ProductSoldHistory from "./ProductSoldHistory";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <>
      <ProductSoldHistory id={id} />
    </>
  );
};

export default page;
