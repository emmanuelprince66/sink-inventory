import React from "react";

import Layout from "@/components/app/layout";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
