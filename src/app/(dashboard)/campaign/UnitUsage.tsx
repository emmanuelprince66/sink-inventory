"use client";

import {
  useFetchCampaignCreditUsageQuery,
  type CampaignCreditUsageLog,
} from "@/api/campaign/fetch-credit-usage";
import { CustomModal } from "@/components/app/CustomModal";
import DataGapBadge from "@/components/app/DataGapBadge";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import { MessageSquare } from "lucide-react";
import moment from "moment";
import { useState } from "react";

/**
 * The six usage_type values, from the spec. CREDIT_TOPUP is the only one that
 * adds credit rather than spending it, which is why it reads green.
 */
const TYPE_TONES: Record<string, string> = {
  CAMPAIGN_BROADCAST: "bg-blue-100 text-blue-700",
  MARKET_AUTOMATION: "bg-violet-100 text-violet-700",
  POST_SALE_RECEIPT: "bg-gray-100 text-gray-700",
  LOYALTY_ALERT: "bg-amber-100 text-amber-700",
  BIRTHDAY_WISH: "bg-pink-100 text-pink-700",
  CREDIT_TOPUP: "bg-emerald-100 text-emerald-700",
};

const typeBadgeClass = (usageType: string) =>
  TYPE_TONES[(usageType || "").toUpperCase()] ?? "bg-gray-100 text-gray-700";

const typeLabel = (row: CampaignCreditUsageLog) =>
  row.usage_type_display || row.usage_type || "—";

const UnitUsage = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [selected, setSelected] = useState<CampaignCreditUsageLog | null>(null);

  const { data, isLoading } = useFetchCampaignCreditUsageQuery(
    business_id ?? "",
  );

  const rows = toList<CampaignCreditUsageLog>(data?.data as any);

  // A top-up credits the account, so units_used comes back negative on those
  // rows. Spend is what this tab reports, so only positive charges are summed.
  const totalUnits = rows.reduce(
    (sum, row) => sum + Math.max(0, Number(row.units_used ?? 0)),
    0,
  );
  const charges = rows.filter((row) => Number(row.units_used ?? 0) > 0).length;

  // balance_after is the balance immediately after each charge, so the newest
  // row carries the current one. Rows come back newest first.
  const currentBalance = rows.find(
    (row) => row.balance_after !== undefined && row.balance_after !== null,
  )?.balance_after;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* The ledger records credit being spent, not messages being delivered —
          it has no recipient and no message body, so neither can be shown. */}
      <DataGapBadge
        label="No per-recipient detail"
        needs="Campaign › Usage — GET /campaign/credit-usage/{id}/ is wired and its figures are live. CampaignCreditUsageLog has no recipient and no message body, so the tab can only report what each charge cost, not who it reached: the old Phone column and the message-body panel are gone. usage_type is now mapped straight from the spec's six values (CAMPAIGN_BROADCAST, MARKET_AUTOMATION, POST_SALE_RECEIPT, LOYALTY_ALERT, BIRTHDAY_WISH, CREDIT_TOPUP) — note none of them records whether a message went by SMS or email, so no delivery channel can be shown either. If per-message detail is wanted here, add recipient, message_body and the channel to the log, or expose a separate per-message send log keyed to the campaign."
      />

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            Charges logged
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">{charges}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            Units used
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">{totalUnits}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            {currentBalance === undefined ? "Avg. units / charge" : "Balance"}
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {currentBalance !== undefined
              ? currentBalance
              : charges
                ? (totalUnits / charges).toFixed(1)
                : "0"}
          </p>
        </div>
      </div>

      {/* Usage table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 w-12">
                  No
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600">
                  Description
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600">
                  Type
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Unit
                </th>
                <th className="py-2.5 px-4 text-xs font-medium text-gray-600 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const units = Number(row.units_used ?? 0);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{row.title}</p>
                      {row.created_at && (
                        <p className="text-[11px] text-gray-500">
                          {moment(row.created_at).format("MMM DD, YYYY • h:mm A")}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
                          typeBadgeClass(row.usage_type),
                        )}
                      >
                        {typeLabel(row)}
                      </span>
                    </td>
                    {/* Negative means credit was added rather than spent. */}
                    <td
                      className={cn(
                        "py-3 px-4 text-sm font-medium text-right whitespace-nowrap",
                        units < 0 ? "text-emerald-700" : "text-gray-900",
                      )}
                    >
                      {units < 0 ? `+${Math.abs(units)}` : units}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(row)}
                        className="text-xs h-7 px-2"
                      >
                        View more
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            No campaign usage yet.
          </div>
        )}
      </div>

      <CustomModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Usage Details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {selected.title}
                </p>
                <p className="text-xs text-gray-500">
                  {selected.created_at
                    ? moment(selected.created_at).format(
                        "MMM DD, YYYY • h:mm A",
                      )
                    : "No timestamp"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border border-gray-200 rounded-md p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Type
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {typeLabel(selected)}
                </p>
              </div>
              <div className="border border-gray-200 rounded-md p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Units used
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selected.units_used}
                </p>
              </div>
              {selected.balance_after !== undefined &&
                selected.balance_after !== null && (
                  <div className="border border-gray-200 rounded-md p-3 col-span-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">
                      Balance after
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {selected.balance_after}
                    </p>
                  </div>
                )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default UnitUsage;
