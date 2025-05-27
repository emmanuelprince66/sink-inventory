"use client";

import { ComingSoon } from "@/components/app/ComingSoon";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

const Overview = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ComingSoon />
    </div>
  );
};

export default Overview;
