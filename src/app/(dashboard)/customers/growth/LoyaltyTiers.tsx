"use client";

import { useDeleteLoyaltyTierMutation } from "@/api/loyalty/delete-loyalty-tier";
import { useFetchLoyaltyTiersQuery } from "@/api/loyalty/fetch-loyalty-tiers";
import { useUpdateLoyaltyTierMutation } from "@/api/loyalty/update-loyalty-tier";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUALIFYING_METRICS, useLoyaltyHook } from "@/hooks/useLoyaltyHook";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { toList } from "@/types/api";
import type { LoyaltyTier } from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import { Pencil, Trash2, Trophy } from "lucide-react";
import { useState } from "react";

// Rank drives the visual weight — 1 is the entry tier, higher ranks are richer.
const RANK_TONES = [
  "bg-orange-100 text-orange-700",
  "bg-grey-6 text-grey-3",
  "bg-warning-2 text-warning-1",
  "bg-violet-100 text-violet-700",
];

const TierRow = ({
  tier,
  onDeleted,
}: {
  tier: LoyaltyTier;
  onDeleted: () => void;
}) => {
  const formatMoney = useFormatMoney();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tier.threshold ?? "");

  const { mutate: deleteTier, isPending } = useDeleteLoyaltyTierMutation({
    tierId: tier.id ?? "",
    onSuccess: onDeleted,
  });

  const { mutate: updateTier, isPending: saving } = useUpdateLoyaltyTierMutation(
    {
      tierId: tier.id ?? "",
      onSuccess: () => {
        setEditing(false);
        onDeleted();
      },
    },
  );

  const threshold =
    tier.qualifying_metric === "SPEND"
      ? formatMoney(Number(tier.threshold ?? 0))
      : `${Number(tier.threshold ?? 0)} visits`;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-grey-6 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-extrabold ${
            RANK_TONES[(tier.rank - 1) % RANK_TONES.length]
          }`}
        >
          {tier.rank}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-grey-1 truncate">{tier.name}</p>
          {editing ? (
            <div className="flex items-center gap-1.5 mt-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-7 w-28 text-xs"
                autoFocus
              />
              <Button
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={saving}
                onClick={() => updateTier({ threshold: draft })}
              >
                {saving ? <Spinner className="w-3 h-3" /> : "Save"}
              </Button>
              <button
                onClick={() => setEditing(false)}
                className="text-[11px] text-grey-3 hover:text-grey-1 cursor-pointer px-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-grey-3">
              Reach {threshold} to qualify
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!editing && (
          <button
            onClick={() => {
              setDraft(tier.threshold ?? "");
              setEditing(true);
            }}
            disabled={!tier.id}
            title="Edit threshold"
            className="p-2 rounded-lg text-grey-2 hover:bg-grey-6 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => deleteTier()}
          disabled={isPending || !tier.id}
          title="Delete tier"
          className="p-2 rounded-lg text-error-1 hover:bg-error-2/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

const LoyaltyTiers = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();
  const { tierForm, onTierSubmit, createTierLoading } = useLoyaltyHook();

  const { data, isLoading } = useFetchLoyaltyTiersQuery({
    params: { id: business_id ?? "" },
  });

  const tiers = toList<LoyaltyTier>(data?.data as never).sort(
    (a, b) => a.rank - b.rank,
  );

  const refreshTiers = () =>
    queryClient.invalidateQueries({
      queryKey: [queryKey.loyalty.getLoyaltyTiers],
    });

  return (
    <div className="space-y-4">
      <p className="text-sm text-grey-3">
        Tiers rank members by how much they spend or how often they visit.
        Members move up automatically as they qualify.
      </p>

      {/* Existing tiers */}
      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-grey-5">
          <Trophy className="w-4 h-4 text-primary-green-300" />
          <h4 className="text-sm font-extrabold text-grey-1">
            Tiers ({tiers.length})
          </h4>
        </div>

        {isLoading ? (
          <div className="w-full flex justify-center py-10">
            <Spinner className="text-primary-green-300" />
          </div>
        ) : tiers.length === 0 ? (
          <p className="text-sm text-grey-3 text-center py-8">
            No tiers yet — add your first one below.
          </p>
        ) : (
          tiers.map((tier) => (
            <TierRow key={tier.id} tier={tier} onDeleted={refreshTiers} />
          ))
        )}
      </div>

      {/* Add tier */}
      <Form {...tierForm}>
        <form
          onSubmit={onTierSubmit}
          className="bg-grey-6/60 rounded-2xl p-4 space-y-3"
        >
          <h4 className="text-sm font-extrabold text-grey-1">Add a tier</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={tierForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Gold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={tierForm.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={tierForm.control}
              name="qualifying_metric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualify by</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QUALIFYING_METRICS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={tierForm.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Threshold</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createTierLoading} className="gap-2">
              {createTierLoading && <Spinner className="w-4 h-4" />}
              Add tier
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoyaltyTiers;
