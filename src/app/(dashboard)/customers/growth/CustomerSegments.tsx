"use client";

import { useDeleteSegmentMutation } from "@/api/segment/delete-segment";
import { useFetchSegmentsQuery } from "@/api/segment/fetch-segments";
import { useUpdateSegmentMutation } from "@/api/segment/update-segment";
import { CustomModal } from "@/components/app/CustomModal";
import DataGapBadge from "@/components/app/DataGapBadge";
import { Spinner } from "@/components/app/Spinner";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type { CustomerSegment } from "@/types/segment";
import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import AddCampaign from "../../campaign/AddCampaign";
import AddSegment from "./AddSegment";
import SegmentCustomers from "./SegmentCustomers";
import { asRate } from "./loyaltyFormat";
import { toneFor } from "./segmentTone";

// Revenue, repeat rate and average spend come off the segments payload now.
// A field the endpoint omits still falls back to an em dash rather than a
// confident zero — an unanswered figure and a real zero mean different things
// to a merchant reading a card.

/** Three money tiles across a narrow card, so ₦294K rather than ₦294,000. */
const compactMoney = (amount: number) => {
  if (!Number.isFinite(amount)) return UNAVAILABLE;
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)
    return `₦${(amount / 1_000).toFixed(abs < 10_000 ? 1 : 0)}K`;
  return `₦${Math.round(amount).toLocaleString()}`;
};
const UNAVAILABLE = "—";

const SegmentCard = ({
  segment,
  onView,
  onChanged,
}: {
  segment: CustomerSegment;
  onView: () => void;
  onChanged: () => void;
}) => {
  const tone = toneFor(segment.segment_type, segment.name);
  const isActive = segment.is_active !== false;

  const { mutate: updateSegment, isPending: toggling } =
    useUpdateSegmentMutation({
      segmentId: segment.id ?? "",
      onSuccess: onChanged,
    });

  const { mutate: deleteSegment, isPending: deleting } =
    useDeleteSegmentMutation({
      segmentId: segment.id ?? "",
      onSuccess: onChanged,
    });

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-grey-5 p-4 flex flex-col",
        !isActive && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center",
            tone.iconBg,
          )}
        >
          {tone.icon}
        </div>
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            tone.badgeBg,
          )}
        >
          {Number(segment.customer_count ?? 0)} customers
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-extrabold text-grey-1 truncate">
          {segment.name}
        </h3>
        {!isActive && (
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-grey-6 text-grey-3">
            Paused
          </span>
        )}
      </div>

      {/* Live off the segment list now. A field the endpoint omits still
          falls back to the em dash rather than printing a confident zero. */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          {
            value:
              segment.revenue === undefined || segment.revenue === null
                ? UNAVAILABLE
                : compactMoney(Number(segment.revenue)),
            label: "Revenue",
          },
          {
            value:
              segment.repeat_rate === undefined || segment.repeat_rate === null
                ? UNAVAILABLE
                : `${asRate(segment.repeat_rate)}%`,
            label: "Repeat Rate",
          },
          {
            value:
              segment.avg_spend === undefined || segment.avg_spend === null
                ? UNAVAILABLE
                : compactMoney(Number(segment.avg_spend)),
            label: "Avg Spend",
          },
        ].map((stat) => (
          <div key={stat.label} className="min-w-0 bg-grey-6 rounded-lg py-2 text-center">
            <p className="truncate text-sm font-extrabold text-grey-1">
              {stat.value}
            </p>
            <p className="truncate text-[10px] text-grey-3">{stat.label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onView}
        className={cn(
          "w-full flex items-center justify-center gap-1 py-2 rounded-full text-sm font-bold cursor-pointer transition-colors mt-auto",
          tone.buttonBg,
        )}
      >
        View Customers
        <span aria-hidden>›</span>
      </button>

      <div className="flex items-center justify-end gap-1 mt-2">
        {/* Pause is deliberately absent. GET /customer/segment/{id}/ returns
            only active segments, so setting is_active:false would drop the
            card off this list with no way to bring it back — a one-way door
            dressed up as a toggle. Restored as a pause/resume pair once the
            list endpoint can return inactive segments too.
            A paused segment that somehow appears here can still be resumed. */}
        {!isActive && (
          <button
            onClick={() => updateSegment({ is_active: true })}
            disabled={toggling || !segment.id}
            title="Resume segment"
            className="p-1.5 rounded-lg text-primary-green-300 hover:bg-primary-green-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {toggling ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        {/* Defaults are seeded by the backend and cannot be removed. */}
        {!segment.is_default && (
          <button
            onClick={() => deleteSegment(undefined)}
            disabled={deleting || !segment.id}
            title="Delete segment"
            className="p-1.5 rounded-lg text-error-1 hover:bg-error-2/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const CustomerSegments = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<CustomerSegment | null>(null);
  const [editing, setEditing] = useState<CustomerSegment | null>(null);
  const [creating, setCreating] = useState(false);
  // Customer ids the outreach campaign opens with — captured from the segment
  // view so the audience is exactly the membership that was on screen.
  const [messaging, setMessaging] = useState<string[] | null>(null);

  const { data, isLoading } = useFetchSegmentsQuery({
    params: { id: business_id ?? "" },
  });

  const segments = toList<CustomerSegment>(data?.data as never);

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: [queryKey.segment.getSegments],
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-grey-3">
          Customer segments. Click a segment to view its customers.
        </p>
        <button
          onClick={() => setCreating(true)}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-green-300 text-white text-sm font-bold hover:bg-primary-green-300/90 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Segment
        </button>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-16">
          <Spinner className="text-primary-green-300" />
        </div>
      ) : segments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-grey-5 py-12 text-center">
          <p className="text-sm text-grey-3">
            No segments yet — the default set is created on first load.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {segments.map((segment) => (
              <SegmentCard
                key={segment.id ?? segment.name}
                segment={segment}
                onView={() => setSelected(segment)}
                onChanged={refresh}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DataGapBadge
              label="Paused segments disappear"
              needs="GET /customer/segment/{business_id}/ — one question: does this list include segments with is_active:false? Every segment in the live response comes back is_active:true, so I cannot tell. If inactive ones are filtered out, pausing a segment drops its card off the list with no way to resume it, which is why the UI still offers no Pause. Either confirm inactive segments are returned, or add an include_inactive flag. (revenue, repeat_rate, avg_spend and is_active have all landed and are in use.)"
            />
            <span className="text-[11px] text-grey-4">
              Open a segment to see the customers behind these figures.
            </span>
          </div>
        </>
      )}

      {/* Mount only the open dialog — see the note in LoyaltyPrograms: several
          Radix overlays mounted together can deadlock the page's focus and
          pointer-events locks. */}
      {selected?.id && (
        <CustomModal
          isOpen
          onClose={() => setSelected(null)}
          trigger={false}
          title={selected.name ?? "Segment"}
        >
          <div className="w-full">
            <SegmentCustomers
              segmentId={selected.id}
              // One overlay at a time: close this before opening the next,
              // rather than stacking two Radix dialogs.
              onEditConditions={() => {
                setEditing(selected);
                setSelected(null);
              }}
              onMessage={(customerIds) => {
                setMessaging(customerIds);
                setSelected(null);
              }}
            />
          </div>
        </CustomModal>
      )}

      {messaging && (
        <CustomModal
          isOpen
          onClose={() => setMessaging(null)}
          trigger={false}
          title="Message Segment"
          size="lg"
        >
          <div className="w-full">
            <AddCampaign
              closeModal={() => setMessaging(null)}
              preselectedCustomerIds={messaging}
            />
          </div>
        </CustomModal>
      )}

      {(creating || editing) && (
        <CustomModal
          isOpen
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          trigger={false}
          title={editing ? "Edit Segment" : "Create Segment"}
        >
          <div className="w-full">
            <AddSegment
              segment={editing}
              onDone={() => {
                setCreating(false);
                setEditing(null);
                refresh();
              }}
            />
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default CustomerSegments;
