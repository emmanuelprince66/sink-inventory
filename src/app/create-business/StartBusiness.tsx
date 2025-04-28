import React from "react";

import Link from "next/link";

import AllBusiness from "../(dashboard)/business/AllBusiness";

const StartBusiness = () => {
  return (
    <div className="flex h-full w-full items-center justify-center mt-10">
      <div className="w-full max-w-xl flex flex-col items-center gap-10  bg-white p-4 rounded shadow-md min-h-[60vh]">
        <AllBusiness section={"start"} />
      </div>
    </div>
  );
};

export default StartBusiness;
