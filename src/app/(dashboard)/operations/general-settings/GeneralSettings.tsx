"use client";

import BnplCard from "./BnplCard";
import ShippingTab from "./ShippingTab";

const GeneralSettings = () => {
  return (
    <div className="w-full px-2 sm:px-4 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Tailor the web app settings to create a seamless experience that
          matches your business needs.
        </p>
      </div>

      <ShippingTab />

      {/* Payment Add-ons */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
            Payment Add-ons
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Optional payment products you can offer your customers at checkout.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BnplCard />
        </div>
      </section>
    </div>
  );
};

export default GeneralSettings;
