// src/app/(dashboard)/customers/[id]/page.tsx
import React from "react";
import Contact from "./Contact";

interface Props {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function CustomerPage({ params }: Props) {
  return <Contact id={params.id} />;
}
