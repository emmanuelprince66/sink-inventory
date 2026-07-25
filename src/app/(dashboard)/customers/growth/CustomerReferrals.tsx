"use client";

import { cn } from "@/lib/utils";
import { Gift, Plus, Share2, Users } from "lucide-react";
import { REFERRAL_KPIS, TOP_REFERRERS } from "./dummyGrowthData";

const KPI_STYLES = [
  { bg: "bg-success-2", icon: <Share2 className="w-4 h-4 text-success-1" /> },
  { bg: "bg-warning-2", icon: <Gift className="w-4 h-4 text-warning-1" /> },
  { bg: "bg-info-2", icon: <Users className="w-4 h-4 text-info-1" /> },
];

const CustomerReferrals = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REFERRAL_KPIS.map((kpi, idx) => (
          <div
            key={kpi.label}
            className={cn("rounded-2xl p-4", KPI_STYLES[idx].bg)}
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mb-3">
              {KPI_STYLES[idx].icon}
            </div>
            <p className="text-xs font-bold text-grey-2">{kpi.label}</p>
            <p className="text-2xl font-extrabold text-grey-1 mt-1">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-extrabold text-grey-1">
            Referral Program Settings
          </h3>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-green-300 text-white text-sm font-bold hover:bg-primary-green-300/90 cursor-pointer">
            <Plus className="w-4 h-4" />
            Create Referral Program
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 bg-secondary-6 border border-primary-green-300/15 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-green-300 text-white flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-grey-1">
                Customer Referral — ₦5,000 per successful referral
              </p>
              <p className="text-xs text-grey-3 mt-0.5">
                Customers refer friends. Both earn ₦2,500 wallet credit on
                first purchase.
              </p>
            </div>
          </div>
          <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-success-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success-1" />
            Active
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-grey-5">
          <h3 className="text-sm font-extrabold text-grey-1">Top Referrers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-grey-6 text-[11px] uppercase tracking-wide text-grey-3">
                <th className="text-left font-bold px-4 sm:px-5 py-3">Customer</th>
                <th className="text-left font-bold px-4 py-3">Referral Code</th>
                <th className="text-left font-bold px-4 py-3">Successful Referrals</th>
                <th className="text-left font-bold px-4 py-3">Revenue Generated</th>
                <th className="text-left font-bold px-4 py-3">Status</th>
                <th className="text-left font-bold px-4 sm:px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {TOP_REFERRERS.map((referrer) => (
                <tr
                  key={referrer.code}
                  className="border-b border-grey-6 last:border-0"
                >
                  <td className="px-4 sm:px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary-green-300 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {referrer.initials}
                      </span>
                      <span className="font-bold text-grey-1">
                        {referrer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-grey-2 bg-grey-6 px-2 py-0.5 rounded">
                      {referrer.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey-2">
                    {referrer.successfulReferrals}
                  </td>
                  <td className="px-4 py-3 font-bold text-primary-green-300">
                    {referrer.revenueGenerated}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-bold text-success-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-1" />
                      {referrer.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3">
                    <button className="text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 cursor-pointer">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerReferrals;
