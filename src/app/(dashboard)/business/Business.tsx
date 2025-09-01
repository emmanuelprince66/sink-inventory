"use client";

import AllBusiness from "./AllBusiness";
const Business = () => {
  return (
    <div className="w-full flex flex-col  items-start  h-full">
      <div className="w-full">
        <AllBusiness section={"start"} />
      </div>
    </div>
  );
};

export default Business;
