import EditShipping from "./EditShipping";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <div>
      <EditShipping id={id} />
    </div>
  );
};

export default page;
