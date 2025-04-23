import Contact from "./Contact";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Contact id={id} />
    </div>
  );
}
