"use client";

import { Spinner } from "@/components/app/Spinner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { cn } from "@/lib/utils";
import type { LoyaltyProgram } from "@/types/loyalty";
import { BarChart3, LayoutGrid, QrCode, Users, X } from "lucide-react";
import DetailOverviewTab from "./programDetail/DetailOverviewTab";
import ParticipantsTab from "./programDetail/ParticipantsTab";
import QrCodeTab from "./programDetail/QrCodeTab";
import ReportTab from "./programDetail/ReportTab";
import { TABS, type DetailTab } from "./programDetail/primitives";
import { useProgramDetail } from "./programDetail/useProgramDetail";

const TAB_ICONS: Record<DetailTab, React.ReactNode> = {
  Overview: <LayoutGrid className="h-4 w-4" />,
  Participants: <Users className="h-4 w-4" />,
  "QR Code": <QrCode className="h-4 w-4" />,
  Report: <BarChart3 className="h-4 w-4" />,
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
  const detail = useProgramDetail(program, open);
  const { tab, setTab, isLoading } = detail;
  // The programme payload carries no business name — it lives in the store,
  // same source ProgramQrModal reads for the printed card.
  const businessData = useBusinessDataStore((state: any) => state.businessData);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-md flex flex-col gap-0 bg-white"
      >
        {/* Dark header — programme identity stays visible across every tab. */}
        <div className="shrink-0 bg-primary-green-100 px-4 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-extrabold text-white">
                {program?.name ?? "Campaign"}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-white/55">
                {businessData?.name ?? "Loyalty campaign"}
                {program?.trigger_summary ? ` · ${program.trigger_summary}` : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white cursor-pointer"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Icon above label, active tab underlined — four equal columns so the
            bar reads as a segmented control rather than a row of links. */}
        <div className="flex shrink-0 border-b border-grey-5 bg-white">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 border-b-2 px-1 py-2.5 text-[10px] font-bold cursor-pointer transition-colors",
                  active
                    ? "border-primary-green-300 text-primary-green-300"
                    : "border-transparent text-grey-4 hover:text-grey-2",
                )}
              >
                {TAB_ICONS[t]}
                {t}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="text-primary-green-300" />
            </div>
          ) : (
            <>
              {tab === "Overview" && <DetailOverviewTab detail={detail} />}
              {tab === "Participants" && (
                <ParticipantsTab detail={detail} program={program} />
              )}
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
