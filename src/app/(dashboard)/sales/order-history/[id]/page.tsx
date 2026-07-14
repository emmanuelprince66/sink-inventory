import OrderHistoryDetailPage from "./OrderHistoryDetailPage";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <OrderHistoryDetailPage id={id} />;
};

export default page;
