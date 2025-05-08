"use client";
import { useProductHook } from "@/hooks/useProductHook";
const Details = ({ id }: { id: string }) => {
  const { ProductData } = useProductHook({ id });
  console.log("ProductData", ProductData);
  return <div>Details</div>;
};

export default Details;
