import SupplierById from "./SupplierById";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <SupplierById id={id} />
    </div>
  );
}
