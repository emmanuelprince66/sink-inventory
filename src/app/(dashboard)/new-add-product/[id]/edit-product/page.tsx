import NewAddProduct from "@/app/(dashboard)/new-add-product/NewAddProduct";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <>
      <NewAddProduct id={id} />
    </>
  );
};

export default page;
