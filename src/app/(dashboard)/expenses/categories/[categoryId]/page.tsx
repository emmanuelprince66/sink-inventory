import CategoryDetail from "./CategoryDetail";

const Page = async ({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) => {
  const { categoryId } = await params;
  return <CategoryDetail categoryId={categoryId} />;
};

export default Page;
