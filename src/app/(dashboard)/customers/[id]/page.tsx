import React from "react";
import Contact from "./Contact";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <Contact id={params.id} />;
}
