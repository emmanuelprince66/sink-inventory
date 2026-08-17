"use client";

import { Spinner } from "@/components/app/Spinner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { LoyaltyProgram } from "@/types/loyalty";
import { X } from "lucide-react";
import DetailOverviewTab from "./programDetail/DetailOverviewTab";
import ParticipantsTab from "./programDetail/ParticipantsTab";
import QrCodeTab from "./programDetail/QrCodeTab";
import ReportTab from "./programDetail/ReportTab";
import { TABS } from "./programDetail/primitives";
import { useProgramDetail } from "./programDetail/useProgramDetail";

const ProgramDetailPanel = ({
  program,
  open,
  onClose,
}: {
  program: LoyaltyProgram | null;
  open: boolean;
  onClose: () => void;
}) => {
  const detail = useProgramDetail(program, open);
  const { tab, setTab, isLoading } = detail;

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
              {tab === "Overview" && <DetailOverviewTab detail={detail} />}
              {tab === "Participants" && <ParticipantsTab detail={detail} />}
              {tab === "QR Code" && (
                <QrCodeTab detail={detail} program={program} />
              )}
              {tab === "Report" && <ReportTab detail={detail} />}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProgramDetailPanel;
