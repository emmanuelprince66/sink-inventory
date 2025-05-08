import EditProduct from "./EditProduct";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <div>
      <EditProduct id={id} />
    </div>
  );
};

export default page;
