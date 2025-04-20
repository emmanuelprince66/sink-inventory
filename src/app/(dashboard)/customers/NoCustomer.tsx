import React from "react";

const NoCustomer = () => {
  return (
    <div className="w-full flex-col items-center text-center justify-center h-full mt-[10%]">
      <h2 className="text-lg font-bold text-[#1e1e1e] mt-6">
        No Customer Found
      </h2>
      <p className="text-gray-500 text-sm">Please add a customer.</p>
    </div>
  );
};

export default NoCustomer;
