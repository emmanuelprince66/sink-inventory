"use client";

import { Spinner } from "@/components/app/Spinner";
import { cn } from "@/lib/utils";
import type { LoyaltyProgram } from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import { Gift, Link2, QrCode, Ticket } from "lucide-react";
import { asNumber, asRate, formatRewardAmount } from "../loyaltyFormat";

export interface CampaignCardProps {
  program: LoyaltyProgram;
  onEdit: (program: LoyaltyProgram) => void;
  onShowQr: (program: LoyaltyProgram) => void;
  onViewParticipants: (program: LoyaltyProgram) => void;
  onOpenLandingPage: (program: LoyaltyProgram) => void;
  openingLandingPage: boolean;
}

const CampaignCard = ({
  program,
  onEdit,
  onShowQr,
  onViewParticipants,
  onOpenLandingPage,
  openingLandingPage,
}: CampaignCardProps) => {
  const formatMoney = useFormatMoney();
  const isActive = (program.status ?? "ACTIVE") === "ACTIVE";
  // Sample rows carry a non-UUID id; only real programmes can be opened.
  const isPersisted = Boolean(program.id && program.id.length > 20);

  // total_rewards_given_out_value is denominated in whatever the campaign
  // hands out — currency for credit, a raw percentage for PERCENTAGE, a count
  // for POINTS. Shared with the detail sheet's report so one campaign reads
  // the same in the list and on the panel it opens.
  const givenOut = formatRewardAmount(
    program.total_rewards_given_out_value,
    program.reward_type,
    formatMoney,
  );

  const cells = [
    { value: asNumber(program.enrolled_count), label: "Enrolled" },
    { value: asNumber(program.active_count), label: "Active" },
    { value: asNumber(program.completed_members_count), label: "Completed" },
    { value: `${asRate(program.completion_rate)}%`, label: "Rate" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-secondary-6 text-primary-green-300 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-grey-1 truncate">
              {program.name}
            </h4>
            <p className="text-xs text-grey-3 mt-0.5">
              Trigger:{" "}
              <span className="font-bold text-grey-2">
                {program.trigger_summary ?? "—"}
              </span>{" "}
              · Reward:{" "}
              <span className="font-bold text-grey-2">
                {program.reward_summary ?? "—"}
              </span>
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full",
            isActive ? "bg-success-2 text-success-1" : "bg-grey-6 text-grey-3",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isActive ? "bg-success-1" : "bg-grey-4",
            )}
          />
          {isActive ? "Active" : "Paused"}
        </span>
      </div>

      {/* Enrolled / Active / Completed / Rate */}
      <div className="grid grid-cols-4 border-y border-grey-5 divide-x divide-grey-5">
        {cells.map((cell) => (
          <div key={cell.label} className="min-w-0 px-1 py-3 text-center">
            <p className="truncate text-sm sm:text-base font-extrabold text-grey-1">
              {cell.value}
            </p>
            <p className="truncate text-[10px] text-grey-3 mt-0.5">
              {cell.label}
            </p>
          </div>
        ))}
      </div>

      {/* Rewards given out */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-warning-2/50">
        <div className="flex items-center gap-2 min-w-0">
          <Gift className="w-4 h-4 text-warning-1 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-grey-1">
              Total Rewards Given Out
            </p>
            <p className="text-[10px] text-grey-3">
              {asNumber(program.completions_count)} completions ·{" "}
              {asNumber(program.cancelled_rewards_count)} cancelled
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-extrabold text-error-1">{givenOut}</p>
          <p className="text-[10px] text-grey-3">
            Retention: {asRate(program.retention_rate)}%
          </p>
        </div>
      </div>

      {/* Actions — the three text links wrap on mobile and View Participants
          takes its own full-width row rather than being squeezed to an
          unreadable pill. */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            onClick={() => onEdit(program)}
            disabled={!isPersisted}
            className="text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button
            onClick={() => onShowQr(program)}
            disabled={!isPersisted}
            className="flex items-center gap-1 text-xs font-bold text-grey-2 hover:text-grey-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </button>
          {/* Deliberately not a link to program.qr_url — that field is the QR
              *image* on S3 (…/loyalty/qrcodes/<id>.png), so linking it opened
              a picture rather than the page. The join URL needs the campaign's
              token, which only the detail endpoint carries, so resolve it on
              click and open the real landing page. */}
          <button
            onClick={() => onOpenLandingPage(program)}
            disabled={!isPersisted || openingLandingPage}
            className="flex items-center gap-1 text-xs font-bold text-grey-2 hover:text-grey-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {openingLandingPage ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              <Link2 className="w-3.5 h-3.5" />
            )}
            Landing Page
          </button>
        </div>
        <button
          onClick={() => onViewParticipants(program)}
          disabled={!isPersisted}
          className="w-full shrink-0 rounded-full bg-primary-green-100 px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-green-100/90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto sm:py-1.5"
        >
          View Participants
        </button>
      </div>
    </div>
  );
};

export default CampaignCard;
