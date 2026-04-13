import EditComboPage from "./EditComboPage";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <EditComboPage comboId={id} />;
};

export default page;
