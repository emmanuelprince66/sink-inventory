"use client";

import {
  messagesSentFrom,
  useFetchCampaignCreditUsageQuery,
  type CampaignCreditUsageLog,
} from "@/api/campaign/fetch-credit-usage";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import {
  CheckCircle2,
  Download,
  MessageSquare,
  Send,
  Zap,
} from "lucide-react";
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

const StatTile = ({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: string;
}) => (
  <div className="border border-grey-5 rounded-2xl p-4 bg-white">
    <p className={cn("flex items-center gap-1.5 text-xs font-bold", tone)}>
      {icon}
      {label}
    </p>
    <p className="text-xl font-extrabold text-grey-1 mt-1.5">{value}</p>
  </div>
);

/** Escapes a cell so a comma or quote in a title cannot shift the columns. */
const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** The channel filter, as tabs. "" is the unfiltered default. */
const CHANNEL_FILTERS = [
  { value: "", label: "All channels" },
  { value: "SMS", label: "SMS" },
  { value: "EMAIL", label: "Email" },
] as const;

const UnitUsage = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [selected, setSelected] = useState<CampaignCreditUsageLog | null>(null);
  const [channel, setChannel] = useState("");

  const { data, isLoading } = useFetchCampaignCreditUsageQuery(
    business_id ?? "",
    { channel },
  );

  const page = data?.data;
  const rows = toList<CampaignCreditUsageLog>(page as any);
  const stats = page?.stats;

  /**
   * Spend and balance come from the server's totals where it sends them.
   *
   * The row maths below only ever saw one page, so a business past its first
   * fifteen charges was shown a figure that shrank as it paged. The fallbacks
   * are for a backend that predates `stats`.
   */
  const totalUnits =
    stats?.total_credits_used != null
      ? Number(stats.total_credits_used)
      : // A top-up credits the account, so units_used comes back negative on
        // those rows. Spend is what this tab reports, so only positive
        // charges are summed.
        rows.reduce(
          (sum, row) => sum + Math.max(0, Number(row.units_used ?? 0)),
          0,
        );

  /** Charges, which is not the same number as messages — see below. */
  const charges =
    page?.total ?? rows.filter((row) => Number(row.units_used ?? 0) > 0).length;

  /**
   * Messages actually sent, across every page.
   *
   * One broadcast charge can carry 142 messages, so this tile used to count
   * charges and read low by whatever the average audience size was.
   */
  const messagesSent = messagesSentFrom(page);

  const currentBalance =
    stats?.current_balance != null
      ? Number(stats.current_balance)
      : // balance_after is the balance immediately after each charge, so the
        // newest row carries the current one. Rows come back newest first.
        rows.find(
          (row) => row.balance_after !== undefined && row.balance_after !== null,
        )?.balance_after;

  // Built from the rows already on screen rather than a second request, so
  // the file always matches what the user is looking at.
  const handleExportCsv = () => {
    const header = [
      "Date",
      "Campaign",
      "Channel",
      "Recipients",
      "Type",
      "Units Used",
      "Balance After",
    ];
    const body = rows.map((row) => [
      row.created_at ? moment(row.created_at).format("YYYY-MM-DD HH:mm") : "",
      row.title,
      row.channel_display ?? "",
      row.recipient ?? row.recipients_count ?? "",
      typeLabel(row),
      row.units_used ?? "",
      row.balance_after ?? "",
    ]);

    const csv = [header, ...body]
      .map((line) => line.map(csvCell).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `credit-usage-${moment().format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          icon={<Zap className="w-4 h-4" />}
          tone="text-warning-1"
          label="Total Spent"
          value={`${totalUnits} Units`}
        />
        {/* Messages, not charges. One broadcast is a single ledger row
            carrying however many recipients, so the paginator's count reads
            far lower than what actually went out. */}
        <StatTile
          icon={<Send className="w-4 h-4" />}
          tone="text-info-1"
          label="Total Sent"
          value={
            messagesSent === undefined
              ? `${charges} Charges`
              : `${messagesSent.toLocaleString()} Messages`
          }
        />
        <StatTile
          icon={<CheckCircle2 className="w-4 h-4" />}
          tone="text-primary-green-300"
          label="Remaining"
          value={
            currentBalance !== undefined ? `${currentBalance} Units` : "—"
          }
        />
      </div>

      {/* Usage table */}
      <div className="border border-grey-5 rounded-2xl overflow-hidden bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-grey-5">
          <p className="text-sm font-extrabold text-grey-1">
            Credit Usage Log
          </p>

          <div className="flex items-center gap-3">
            {/* Filtered server-side, so the totals above move with it rather
                than describing rows that are no longer on screen. */}
            <div className="flex items-center gap-1 rounded-full bg-grey-6 p-1">
              {CHANNEL_FILTERS.map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  onClick={() => setChannel(option.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer",
                    channel === option.value
                      ? "bg-white text-primary-green-300 shadow-sm"
                      : "text-grey-3 hover:text-grey-2",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={rows.length === 0}
              onClick={handleExportCsv}
              className="gap-1.5 text-xs h-8"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-grey-6 border-b border-grey-5 text-left">
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3">
                  Date
                </th>
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3">
                  Campaign
                </th>
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3">
                  Channel
                </th>
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3">
                  Recipients
                </th>
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3">
                  Type
                </th>
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3 text-right">
                  Units Used
                </th>
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3 text-right">
                  Balance After
                </th>
                <th className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wide text-grey-3 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const units = Number(row.units_used ?? 0);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-grey-6 hover:bg-grey-6/50"
                  >
                    <td className="py-3 px-4 text-sm text-grey-3 whitespace-nowrap">
                      {row.created_at
                        ? moment(row.created_at).format("MMM D, YYYY")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-grey-1">
                      {row.title}
                    </td>
                    {/* channel_display and recipient are filled for every row,
                        top-ups included ("Top-Up" / "N/A (Wallet)"), so
                        neither needs a fallback of its own. The raw fields
                        stand in only for rows written before the serializer
                        started composing them. */}
                    <td className="py-3 px-4 text-sm text-grey-3 whitespace-nowrap">
                      {row.channel_display ?? row.channel ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-grey-3 whitespace-nowrap">
                      {row.recipient ?? row.recipients_count ?? "—"}
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
                        "py-3 px-4 text-sm font-bold text-right whitespace-nowrap",
                        units < 0 ? "text-primary-green-300" : "text-error-1",
                      )}
                    >
                      {units < 0 ? `+${Math.abs(units)}` : `-${units}`}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-primary-green-300 text-right whitespace-nowrap">
                      {row.balance_after ?? "—"}
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
          <div className="py-10 text-center text-sm text-grey-3">
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
              <div className="border border-gray-200 rounded-md p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Channel
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selected.channel_display ?? selected.channel ?? "—"}
                </p>
              </div>
              <div className="border border-gray-200 rounded-md p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Recipients
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {selected.recipient ?? selected.recipients_count ?? "—"}
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
              {/* What actually went out. The reason this panel was removed
                  once — the log had no body to show — no longer holds. */}
              {selected.message_body && (
                <div className="border border-gray-200 rounded-md p-3 col-span-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                    Message
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                    {selected.message_body}
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
