"use client";

import ShippingTab from "./ShippingTab";

const GeneralSettings = () => {
  return (
    <div className="w-full px-2 sm:px-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Tailor the web app settings to create a seamless experience that
          matches your business needs.
        </p>
      </div>

      <ShippingTab />
    </div>
  );
};

export default GeneralSettings;
