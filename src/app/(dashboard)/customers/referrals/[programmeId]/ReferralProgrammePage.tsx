"use client";

import {
  useFetchReferralParticipantsQuery,
  useFetchReferralProgrammeQuery,
} from "@/api/customer-referral";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useQueryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type { CustomerReferralParticipant } from "@/types/customerReferral";
import { useFormatMoney } from "@/utils/formatMoney";
import {
  ChevronLeft,
  Link2,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ProgrammeSettings from "../../growth/referrals/ProgrammeSettings";
import AddParticipantForm from "./AddParticipantForm";
import ParticipantCard from "./ParticipantCard";

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <div className="min-w-0 rounded-xl bg-primary-green-500 px-3 py-3.5 text-center">
    <div className="flex justify-center text-primary-green-300">{icon}</div>
    <p className="mt-1.5 truncate text-lg font-extrabold text-grey-1">{value}</p>
    <p className="truncate text-[10px] text-grey-3">{label}</p>
  </div>
);

const ReferralProgrammePage = ({ programmeId }: { programmeId: string }) => {
  const router = useRouter();
  const formatMoney = useFormatMoney();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Fetched by id rather than read from the list, so the URL works on its own.
  const { data: programmeRes, isLoading } = useFetchReferralProgrammeQuery({
    params: { programmeId },
  });
  const programme = programmeRes?.data;

  const { data: participantsRes, isLoading: participantsLoading } =
    useFetchReferralParticipantsQuery({
      params: { programmeId, search: search || undefined },
    });
  const participants = toList<CustomerReferralParticipant>(
    participantsRes?.data as any,
  );

  const refreshProgramme = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [queryKey.customerReferral.getProgramme, programmeId],
    });
    // The list behind the tab shows the same counters.
    queryClient.invalidateQueries({
      queryKey: [queryKey.customerReferral.getProgrammes],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKey.customerReferral.getOverview],
    });
  }, [queryClient, programmeId]);

  const onParticipantAdded = useCallback(() => {
    setAdding(false);
    queryClient.invalidateQueries({
      queryKey: [queryKey.customerReferral.getParticipants, programmeId],
    });
    // participants_count on the header tile moves too.
    refreshProgramme();
  }, [queryClient, programmeId, refreshProgramme]);

  const copyLink = (link?: string | null) => {
    if (!link) return showToast("This participant has no link yet", "error");
    navigator.clipboard
      .writeText(link)
      .then(() => showToast("Referral link copied", "success"))
      .catch(() => showToast("Could not copy the link", "error"));
  };

  // Back to the tab this was opened from, not just /customers.
  const back = () => router.push("/customers?tab=Referrals");

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm font-bold text-grey-1">Programme not found</p>
        <p className="max-w-sm text-xs text-grey-3">
          It may have been removed, or the link is out of date.
        </p>
        <Button variant="outline" className="h-10 rounded-xl" onClick={back}>
          Back to Referrals
        </Button>
      </div>
    );
  }

  const isActive = programme.is_active !== false;
  const [usedRaw] = (programme.cap_progress ?? "").split("/");
  const used = Number(usedRaw ?? 0) || 0;
  const cap = Number(programme.reward_cap ?? 0) || 0;
  const capPct = cap > 0 ? Math.round((used / cap) * 100) : 0;

  const created = programme.created_at
    ? new Date(programme.created_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <button
              onClick={back}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-grey-3 hover:bg-grey-6 hover:text-grey-1 cursor-pointer"
              title="Back to Referrals"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold text-primary-green-300 sm:text-xl">
                {programme.name}
              </h1>
              <p className="mt-0.5 text-[11px] text-grey-3">
                Referral Programmes · Created {created}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                isActive
                  ? "bg-primary-green-500 text-primary-green-300"
                  : "bg-grey-6 text-grey-3",
              )}
            >
              {isActive ? "Active" : "Paused"}
            </span>
            <Button
              variant="outline"
              className="h-9 gap-1.5 rounded-xl text-xs font-bold"
              onClick={() => setShowSettings(true)}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Settings
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            value={String(programme.participants_count ?? 0)}
            label="Participants"
          />
          <StatCard
            icon={<Link2 className="h-4 w-4" />}
            value={String(programme.referrals_count ?? 0)}
            label="Referrals"
          />
          <StatCard
            icon={<Trophy className="h-4 w-4" />}
            value={formatMoney(Number(programme.total_paid ?? 0))}
            label="Total Paid"
          />
          <StatCard
            icon={<Target className="h-4 w-4" />}
            value={programme.cap_progress ?? `${used}/${cap}`}
            label={`Cap (${capPct}%)`}
          />
        </div>
      </div>

      {/* Reward terms */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary-green-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
              Reward Rate
            </p>
            <p className="text-2xl font-extrabold text-white">
              {Number(programme.reward_percentage ?? 0)}%
            </p>
            <p className="text-[10px] text-white/50">of purchase value</p>
          </div>
          <div className="hidden h-10 w-px bg-white/15 sm:block" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
              Reward Cap
            </p>
            <p className="text-2xl font-extrabold text-white">{cap}</p>
            <p className="text-[10px] text-white/50">max rewards</p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1.5">
          {programme.notify_sms && (
            <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70">
              <MessageSquare className="h-3 w-3" />
              SMS
            </span>
          )}
          {programme.notify_email && (
            <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70">
              <Mail className="h-3 w-3" />
              Email
            </span>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-grey-1">Participants</h2>
        <Button
          className="h-9 gap-1.5 rounded-xl text-xs font-bold"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code..."
          className="h-11 rounded-xl pl-9"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {participantsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : participants.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-grey-5 bg-white py-12 text-center text-sm text-grey-3">
            {search
              ? "No participants match that search."
              : "Nobody is enrolled yet. Add a loyal customer to mint their referral link."}
          </p>
        ) : (
          participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onCopy={copyLink}
            />
          ))
        )}
      </div>

      {showSettings && (
        <CustomModal
          isOpen
          onClose={() => setShowSettings(false)}
          trigger={false}
          title="Programme Settings"
        >
          <ProgrammeSettings
            programme={programme}
            onChanged={() => {
              refreshProgramme();
              setShowSettings(false);
            }}
            onCancel={() => setShowSettings(false)}
          />
        </CustomModal>
      )}

      {adding && (
        <CustomModal
          isOpen
          onClose={() => setAdding(false)}
          trigger={false}
          title="Enrol a Customer"
        >
          <AddParticipantForm
            programmeId={programmeId}
            onAdded={onParticipantAdded}
            onCancel={() => setAdding(false)}
          />
        </CustomModal>
      )}
    </div>
  );
};

export default ReferralProgrammePage;
