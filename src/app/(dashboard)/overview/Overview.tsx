"use client";
import React from "react";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

const Overview = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  return <div>Overview</div>;
};

export default Overview;
