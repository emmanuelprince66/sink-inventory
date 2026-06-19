import CategoryDetail from "./CategoryDetail";

const Page = async ({
  params,
}: {
  params: Promise<{ category: string }>;
}) => {
  const { category } = await params;
  return <CategoryDetail categoryParam={category} />;
};

export default Page;
