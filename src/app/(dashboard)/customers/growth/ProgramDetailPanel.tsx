"use client";

import { useFetchLoyaltyProgramDetailQuery } from "@/api/loyalty/fetch-loyalty-program-detail";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import type {
  LoyaltyParticipantProgress,
  LoyaltyProgram,
} from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import {
  BadgeCheck,
  BarChart3,
  Copy,
  Download,
  Printer,
  QrCode,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const TABS = ["Overview", "Participants", "QR Code", "Report"] as const;
type Tab = (typeof TABS)[number];

const PARTICIPANT_FILTERS = ["All", "Active", "Completed", "At Risk"] as const;
type ParticipantFilter = (typeof PARTICIPANT_FILTERS)[number];

/** Above this many steps a stamp card stops being readable — and stops being
 *  safe to render one node at a time. Progress falls back to a bar. */
const MAX_STAMPS = 12;

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

const asRate = (value: number | string | undefined | null) => {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

/** Green when healthy, amber mid, red when poor — matches the design's bars. */
const rateTone = (rate: number) =>
  rate >= 70
    ? { bar: "bg-emerald-500", text: "text-emerald-700" }
    : rate >= 40
      ? { bar: "bg-amber-500", text: "text-amber-700" }
      : { bar: "bg-rose-500", text: "text-rose-700" };

const rateCaption = (rate: number) =>
  rate >= 70
    ? "Excellent retention"
    : rate >= 40
      ? "Room to improve"
      : "Needs attention";

const StatTile = ({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tone: string;
}) => (
  <div className="rounded-xl border border-grey-5 bg-white p-3">
    <div className={cn("flex items-center gap-1.5 text-[11px] font-bold", tone)}>
      {icon}
      {label}
    </div>
    <p className="mt-1.5 text-xl font-extrabold text-grey-1">{value}</p>
  </div>
);

const RateBar = ({
  label,
  rate,
  caption,
}: {
  label: string;
  rate: number;
  caption?: string;
}) => {
  const tone = rateTone(rate);
  return (
    <div className="rounded-xl border border-grey-5 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-grey-1">{label}</p>
        <p className={cn("text-sm font-extrabold", tone.text)}>
          {asRate(rate)}%
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-grey-6">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
        />
      </div>
      {caption && (
        <p className={cn("mt-1.5 text-[11px] font-medium", tone.text)}>
          {caption}
        </p>
      )}
    </div>
  );
};

const ProgramDetailPanel = ({
  program,
  open,
  onClose,
}: {
  program: LoyaltyProgram | null;
  open: boolean;
  onClose: () => void;
}) => {
  const formatMoney = useFormatMoney();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("Overview");
  const [filter, setFilter] = useState<ParticipantFilter>("All");

  const programId = program?.id ?? "";
  const { data, isLoading } = useFetchLoyaltyProgramDetailQuery({
    params: { programId },
  });

  // Reset to the first tab whenever a different programme is opened, so the
  // panel never opens showing the previous programme's Report tab.
  useEffect(() => {
    if (open) {
      setTab("Overview");
      setFilter("All");
    }
  }, [open, programId]);

  // Radix locks the page by setting pointer-events:none on <body> while an
  // overlay is open, and restores it on close. With several dialogs mounted
  // alongside this sheet, that restore is unreliable — the style survives the
  // close and the whole page stops accepting clicks, which reads as a freeze.
  // Clearing it ourselves once the sheet is closed is the safety net.
  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => {
      if (document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [open]);

  const detail = data?.data;
  const overview = detail?.overview;
  const report = detail?.reward_cost_report;
  const qr = detail?.qr_details;
  const participants = detail?.participants ?? [];

  // Fallback target for participants whose own progress_target is missing.
  // Deliberately NOT the programme's condition threshold: on a SPEND
  // programme that value is the naira target (e.g. 50000), and feeding it to
  // the stamp grid rendered 50,000 nodes per row and froze the page.
  const target = Number(participants[0]?.progress_target ?? 0) || 0;

  const filtered = participants.filter((p) => {
    if (filter === "All") return true;
    const status = (p.status ?? "").toUpperCase();
    if (filter === "Active") return status === "ACTIVE";
    if (filter === "Completed")
      return status === "COMPLETED" || status === "REWARDED";
    return status === "AT_RISK" || status === "AT RISK";
  });

  const joinUrl = qr?.token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/loyalty/join/${qr.token}`
    : "";

  const copyJoinUrl = () => {
    if (!joinUrl) return;
    navigator.clipboard
      .writeText(joinUrl)
      .then(() => showToast("Join link copied", "success"))
      .catch(() => showToast("Could not copy the link", "error"));
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-md flex flex-col gap-0"
      >
        {/* Dark header — program identity stays visible across every tab. */}
        <div className="bg-grey-1 px-4 py-3.5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-extrabold text-white">
                {program?.name ?? "Campaign"}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-white/60">
                {program?.trigger_summary ?? "Loyalty campaign"}
                {program?.reward_summary ? ` · ${program.reward_summary}` : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 border-b border-grey-5 bg-white">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 border-b-2 px-1 py-2.5 text-[11px] font-bold cursor-pointer transition-colors",
                tab === t
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-1",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-grey-6/40 p-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="text-primary-green-300" />
            </div>
          ) : (
            <>
              {tab === "Overview" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <StatTile
                      icon={<Users className="h-3.5 w-3.5" />}
                      value={overview?.total_enrolled ?? 0}
                      label="Total Enrolled"
                      tone="text-sky-600"
                    />
                    <StatTile
                      icon={<BadgeCheck className="h-3.5 w-3.5" />}
                      value={overview?.active_now ?? 0}
                      label="Active Now"
                      tone="text-emerald-600"
                    />
                    <StatTile
                      icon={<BadgeCheck className="h-3.5 w-3.5" />}
                      value={overview?.completed ?? 0}
                      label="Completed"
                      tone="text-amber-600"
                    />
                    <StatTile
                      icon={<XCircle className="h-3.5 w-3.5" />}
                      value={overview?.cancelled ?? 0}
                      label="Cancelled"
                      tone="text-rose-600"
                    />
                  </div>

                  <RateBar
                    label="Retention Rate"
                    rate={Number(overview?.retention_rate ?? 0)}
                    caption={rateCaption(Number(overview?.retention_rate ?? 0))}
                  />
                  <RateBar
                    label="Completion Rate"
                    rate={Number(overview?.completion_rate ?? 0)}
                  />

                  <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <p className="text-xs font-bold text-amber-900">
                      Total given out
                    </p>
                    <p className="text-sm font-extrabold text-amber-900">
                      {formatMoney(Number(overview?.total_given_out ?? 0))}
                    </p>
                  </div>
                </div>
              )}

              {tab === "Participants" && (
                <div className="space-y-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {PARTICIPANT_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors",
                          filter === f
                            ? "bg-grey-1 text-white"
                            : "bg-white text-grey-3 border border-grey-5 hover:text-grey-1",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {filtered.length === 0 ? (
                    <p className="py-12 text-center text-sm text-grey-3">
                      {participants.length === 0
                        ? "Nobody has joined this campaign yet."
                        : `No ${filter.toLowerCase()} participants.`}
                    </p>
                  ) : (
                    filtered.map((p) => (
                      <ParticipantRow key={p.id} participant={p} target={target} />
                    ))
                  )}
                </div>
              )}

              {tab === "QR Code" && (
                <div className="space-y-3">
                  {!qr?.token ? (
                    <p className="py-12 text-center text-sm text-grey-3">
                      No QR code has been generated for this campaign yet.
                    </p>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-grey-1 p-4 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
                          Loyalty Programme
                        </p>
                        <h4 className="mt-1 text-base font-extrabold text-white">
                          {program?.name}
                        </h4>
                        <p className="mt-0.5 text-[11px] text-white/60">
                          {program?.trigger_summary}
                        </p>

                        <div className="mt-4 flex justify-center">
                          {qr.qr_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={qr.qr_url}
                              alt={`QR code for ${program?.name ?? "campaign"}`}
                              className="h-40 w-40 rounded-xl bg-white object-contain p-2"
                            />
                          ) : (
                            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-white/30 px-3">
                              <p className="text-[11px] text-white/60">
                                QR image not returned — share the link below.
                              </p>
                            </div>
                          )}
                        </div>

                        <p className="mt-3 text-xs font-bold text-white">
                          Scan to join
                        </p>
                        <p className="text-[10px] text-white/50">
                          Earn {program?.reward_summary ?? "a reward"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-grey-5 bg-white p-3">
                        <p className="text-[11px] font-bold text-grey-2">
                          Landing page
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-grey-3">
                            {joinUrl}
                          </p>
                          <button
                            onClick={copyJoinUrl}
                            className="shrink-0 rounded-lg p-1.5 text-grey-3 hover:bg-grey-6 cursor-pointer"
                            title="Copy join link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="gap-1.5 text-xs font-bold"
                          onClick={() => qr.qr_url && window.open(qr.qr_url, "_blank")}
                          disabled={!qr.qr_url}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download QR
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-1.5 text-xs font-bold"
                          onClick={() => window.print()}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print Card
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === "Report" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-primary-green-300" />
                    <h4 className="text-sm font-extrabold text-grey-1">
                      Reward Cost Report
                    </h4>
                  </div>

                  {[
                    {
                      label: "Total Rewards Sent",
                      value: formatMoney(Number(report?.total_rewards_sent ?? 0)),
                      tone: "text-grey-1",
                    },
                    {
                      label: "Total Redeemed",
                      value: formatMoney(Number(report?.total_redeemed ?? 0)),
                      tone: "text-emerald-700",
                    },
                    {
                      label: "Cancelled / Forfeited",
                      value: formatMoney(Number(report?.cancelled_forfeited ?? 0)),
                      tone: "text-rose-700",
                    },
                    {
                      label: "Estimated Retained Revenue",
                      value: formatMoney(
                        Number(report?.estimated_retained_revenue ?? 0),
                      ),
                      tone: "text-sky-700",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-xl border border-grey-5 bg-white px-3 py-2.5"
                    >
                      <p className="text-xs font-medium text-grey-2">
                        {row.label}
                      </p>
                      <p className={cn("text-sm font-extrabold", row.tone)}>
                        {row.value}
                      </p>
                    </div>
                  ))}

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-emerald-900">
                        Estimated ROI
                      </p>
                      <p className="text-base font-extrabold text-emerald-700">
                        {Number(report?.estimated_roi_percentage ?? 0) >= 0
                          ? "+"
                          : ""}
                        {asRate(report?.estimated_roi_percentage)}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-grey-5 bg-white p-3">
                    <p className="mb-2.5 text-xs font-bold text-grey-1">
                      Likelihood of Customer Return
                    </p>
                    {[
                      {
                        label: "After 1st reward",
                        value: report?.return_likelihood?.after_1st_reward ?? 0,
                      },
                      {
                        label: "After 2nd reward",
                        value: report?.return_likelihood?.after_2nd_reward ?? 0,
                      },
                      {
                        label: "After 3rd reward+",
                        value:
                          report?.return_likelihood?.after_3rd_reward_plus ?? 0,
                      },
                    ].map((row) => (
                      <div key={row.label} className="mb-2.5 last:mb-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-grey-3">{row.label}</p>
                          <p className="text-[11px] font-bold text-grey-1">
                            {asRate(row.value)}%
                          </p>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-grey-6">
                          <div
                            className="h-full rounded-full bg-primary-green-300"
                            style={{
                              width: `${Math.min(100, Math.max(0, Number(row.value)))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Stamp-card row: a filled dot per qualifying visit, matching the physical
// loyalty card the QR tab prints.
const ParticipantRow = ({
  participant,
  target,
}: {
  participant: LoyaltyParticipantProgress;
  target: number;
}) => {
  const current = Number(participant.progress_current ?? 0);
  const total = Number(participant.progress_target ?? target) || 0;
  const status = (participant.status ?? "ACTIVE").toUpperCase();

  const statusTone =
    status === "COMPLETED" || status === "REWARDED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "AT_RISK" || status === "AT RISK"
        ? "bg-rose-100 text-rose-700"
        : "bg-sky-100 text-sky-700";

  return (
    <div className="rounded-xl border border-grey-5 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grey-6 text-[10px] font-extrabold text-grey-2">
            {initials(participant.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-grey-1">
              {participant.name}
            </p>
            <p className="truncate text-[10px] text-grey-3">
              {participant.joined_at
                ? `Joined ${new Date(participant.joined_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                : "Joined —"}
              {participant.last_qualifying_visit_at
                ? ` · Last visit ${new Date(participant.last_qualifying_visit_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                : ""}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
            statusTone,
          )}
        >
          {status === "AT_RISK" ? "At Risk" : status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </div>

      {total > 0 && (
        <>
          {/* A stamp card only reads as one past a handful of steps. Beyond
              MAX_STAMPS — and on spend-based programmes, where the target is a
              money amount — fall back to a bar. Without this cap a target of
              50,000 renders 50,000 nodes and locks the browser. */}
          {total <= MAX_STAMPS ? (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold",
                    i < current
                      ? "bg-primary-green-300 text-white"
                      : "bg-grey-6 text-grey-4",
                  )}
                >
                  {i < current ? "✓" : i + 1}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-grey-6">
              <div
                className="h-full rounded-full bg-primary-green-300"
                style={{
                  width: `${Math.min(100, Math.max(0, (current / total) * 100))}%`,
                }}
              />
            </div>
          )}
          <p className="mt-1.5 text-[10px] text-grey-3">
            {total <= MAX_STAMPS
              ? `Visit ${current} of ${total}`
              : `${current.toLocaleString()} of ${total.toLocaleString()}`}
          </p>
        </>
      )}
    </div>
  );
};

export default ProgramDetailPanel;
