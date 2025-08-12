import ViewOrder from "./ViewOrder";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <ViewOrder id={id} />
    </div>
  );
}
