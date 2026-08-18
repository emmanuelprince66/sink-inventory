"use client";

import {
  useAddReferralParticipantMutation,
  useFetchReferralParticipantsQuery,
  useUpdateReferralProgrammeMutation,
} from "@/api/customer-referral";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type {
  CustomerReferralParticipant,
  CustomerReferralProgramme,
} from "@/types/customerReferral";
import { useFormatMoney } from "@/utils/formatMoney";
import { Copy, Plus, Search } from "lucide-react";
import { useState } from "react";

const ParticipantRow = ({
  participant,
  onCopy,
}: {
  participant: CustomerReferralParticipant;
  onCopy: (link?: string | null) => void;
}) => {
  const formatMoney = useFormatMoney();

  return (
    <div className="rounded-xl border border-grey-5 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grey-6 text-[10px] font-extrabold text-grey-2">
            {participant.initials || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-grey-1">
              {participant.customer_name}
            </p>
            <p className="truncate text-[11px] text-grey-3">
              {participant.phone} · {participant.code}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-extrabold text-primary-green-300">
            {formatMoney(Number(participant.total_earned ?? 0))}
          </p>
          <p className="text-[10px] text-grey-3">
            {participant.referrals_count ?? 0} referred ·{" "}
            {participant.paid_count ?? 0} paid
          </p>
        </div>
      </div>

      {participant.referral_link && (
        <button
          onClick={() => onCopy(participant.referral_link)}
          className="mt-2.5 flex w-full min-w-0 items-center gap-2 rounded-lg bg-grey-6 px-3 py-2 text-left cursor-pointer hover:bg-grey-6/70"
          title="Copy referral link"
        >
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-grey-2">
            {participant.referral_link}
          </span>
          <Copy className="h-3.5 w-3.5 shrink-0 text-grey-3" />
        </button>
      )}
    </div>
  );
};

const ManageReferralProgramme = ({
  programme,
  onCopy,
  onChanged,
}: {
  programme: CustomerReferralProgramme;
  onCopy: (link?: string | null) => void;
  onChanged: () => void;
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useFetchReferralParticipantsQuery({
    params: { programmeId: programme.id, search: search || undefined },
  });

  const participants = toList<CustomerReferralParticipant>(data?.data as any);

  const { mutate: addParticipant, isPending: addPending } =
    useAddReferralParticipantMutation({
      programmeId: programme.id,
      onSuccess: () => {
        setName("");
        setPhone("");
        setEmail("");
        setAdding(false);
        queryClient.invalidateQueries({
          queryKey: [queryKey.customerReferral.getParticipants, programme.id],
        });
        onChanged();
      },
    });

  const isActive = programme.is_active !== false;

  const { mutate: updateProgramme, isPending: updatePending } =
    useUpdateReferralProgrammeMutation({
      programmeId: programme.id,
      onSuccess: onChanged,
    });

  const submitParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Enter the customer's name.");
    if (!phone.trim()) return setError("Enter the customer's phone number.");

    addParticipant({
      name: name.trim(),
      phone: phone.trim(),
      // The field is nullable, so an empty box sends null rather than "".
      email: email.trim() || null,
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* Programme summary and the one control that changes it here. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-grey-6/60 px-3.5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-grey-1">
            {programme.name}
          </p>
          <p className="text-[11px] text-grey-3">
            {Number(programme.reward_percentage ?? 0)}% per referral · cap{" "}
            {programme.cap_progress ?? programme.reward_cap}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-9 shrink-0 rounded-xl text-xs font-bold"
          disabled={updatePending}
          onClick={() => updateProgramme({ is_active: !isActive })}
        >
          {updatePending && <Spinner className="h-3.5 w-3.5" />}
          {isActive ? "Pause programme" : "Resume programme"}
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants"
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <Button
          className="h-10 shrink-0 gap-1.5 rounded-xl"
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="h-4 w-4" />
          {adding ? "Close" : "Add Participant"}
        </Button>
      </div>

      {adding && (
        <form
          onSubmit={submitParticipant}
          className="flex flex-col gap-3 rounded-xl border border-grey-5 p-3.5"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer name"
            className="h-11 rounded-xl"
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="Phone number"
            className="h-11 rounded-xl"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email (optional)"
            className="h-11 rounded-xl"
          />
          {error && <p className="text-xs font-medium text-error-1">{error}</p>}
          <Button
            type="submit"
            className="h-11 gap-2 rounded-xl"
            disabled={addPending}
          >
            {addPending && <Spinner className="h-4 w-4" />}
            Add &amp; generate link
          </Button>
        </form>
      )}

      <div className={cn("flex flex-col gap-2.5")}>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : participants.length === 0 ? (
          <p className="py-12 text-center text-sm text-grey-3">
            {search
              ? "No participants match that search."
              : "Nobody is enrolled yet. Add a loyal customer to mint their referral link."}
          </p>
        ) : (
          participants.map((participant) => (
            <ParticipantRow
              key={participant.id}
              participant={participant}
              onCopy={onCopy}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ManageReferralProgramme;
