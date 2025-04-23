import React from "react";
import Contact from "./Contact";

export default function page({ params }: { params: { id: string } }) {
  return <Contact id={params.id} />;
}
