"use client";

import { useAddReferralParticipantMutation } from "@/api/customer-referral";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { Check, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Same stable tint the customers table and POS drawer use, so a face keeps its
// colour wherever it appears.
const AVATAR_TONES = [
  "bg-primary-green-300",
  "bg-emerald-500",
  "bg-teal-600",
  "bg-sky-600",
  "bg-violet-500",
  "bg-amber-500",
];

const avatarTone = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
};

const initialsOf = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

/**
 * Enrols an existing customer.
 *
 * This used to be three empty inputs, which quietly created a second record for
 * someone the business already had — a duplicate name and phone with none of
 * their history attached. Picking from the list keeps one customer, one record.
 *
 * The endpoint still takes name and phone rather than a customer id, so the
 * chosen customer's details are what gets posted. If it gains a customer_id
 * field later, that is the only line that changes.
 */
const AddParticipantForm = ({
  programmeId,
  onAdded,
  onCancel,
}: {
  programmeId: string;
  onAdded: () => void;
  onCancel: () => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Matches the POS drawer: search only once it is worth a round trip, and
  // treat an empty box as "show me everyone" rather than as a search.
  const debounced = useDebounce(search, 500);
  const searchTerm =
    debounced.length >= 3 || debounced.length === 0 ? debounced : null;

  const { data, isLoading } = useGetCustomerQuery({
    params: { id: business_id, search: searchTerm, limit: 20, page: 1 },
    enabled: Boolean(business_id),
  });

  const customers: any[] = data?.data?.results?.data ?? [];

  const { mutate: addParticipant, isPending } =
    useAddReferralParticipantMutation({ programmeId, onSuccess: onAdded });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selected) return setError("Pick a customer to enrol.");
    // Phone is the one field the API cannot mint for itself, and a customer
    // saved without one would fail server-side with a less obvious message.
    if (!selected.phone?.trim())
      return setError(
        `${selected.name} has no phone number saved. Add one on their profile first — the referral link is sent by SMS.`,
      );

    addParticipant({
      name: selected.name,
      phone: String(selected.phone).trim(),
      email: selected.email?.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="flex w-full min-w-0 flex-col gap-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Choose a customer
        </label>
        <div className="mt-2">
          <SearchInput
            placeholder="Search by name, phone or email..."
            value={search}
            onValueChange={(value: string) => {
              setSearch(value);
              setSelected(null);
            }}
          />
        </div>
      </div>

      <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[62px] w-full rounded-xl bg-grey-5" />
          ))
        ) : customers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-grey-5 px-4 py-10 text-center">
            <p className="text-sm font-bold text-grey-1">
              {search ? "No customers match that search" : "No customers yet"}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-grey-3">
              {search
                ? "Try a different name or phone number."
                : "Add a customer first, then enrol them here."}
            </p>
            {!search && (
              <Link
                href="/customers"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary-green-300 hover:underline"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Go to Customers
              </Link>
            )}
          </div>
        ) : (
          customers.map((customer) => {
            const isSelected = selected?.id === customer.id;
            return (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  setSelected(customer);
                  setError(null);
                }}
                className={cn(
                  "flex w-full min-w-0 items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors cursor-pointer",
                  isSelected
                    ? "border-primary-green-300 bg-primary-green-500/40"
                    : "border-grey-5 hover:border-primary-green-300",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white",
                    avatarTone(customer.id ?? customer.name ?? ""),
                  )}
                >
                  {customer.initials || initialsOf(customer.name)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-grey-1">
                    {customer.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-grey-3">
                    {customer.phone || "No phone saved"}
                    {customer.email ? ` · ${customer.email}` : ""}
                  </span>
                </span>

                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-primary-green-300" />
                )}
              </button>
            );
          })
        )}
      </div>

      {error && <p className="text-xs font-medium text-error-1">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-11 flex-1 gap-2 rounded-xl"
          disabled={isPending || !selected}
        >
          {isPending && <Spinner className="h-4 w-4" />}
          {selected ? `Enrol ${selected.name}` : "Enrol customer"}
        </Button>
      </div>
    </form>
  );
};

export default AddParticipantForm;
