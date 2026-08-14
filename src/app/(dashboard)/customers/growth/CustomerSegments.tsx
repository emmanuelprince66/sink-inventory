"use client";

import { useDeleteSegmentMutation } from "@/api/segment/delete-segment";
import { useFetchSegmentsQuery } from "@/api/segment/fetch-segments";
import { useUpdateSegmentMutation } from "@/api/segment/update-segment";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { queryKey } from "@/constants/query-key";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { toList } from "@/types/api";
import type { CustomerSegment } from "@/types/segment";
import {
  AlertCircle,
  Crown,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import SegmentCustomers from "./SegmentCustomers";

// segment_type's enum members are not published in the spec, so the icon/tone
// lookup matches on substrings instead of exact keys — an unrecognised type
// still renders with the neutral fallback rather than a blank card.
const TONE_BY_KEYWORD: Array<{
  match: RegExp;
  icon: React.ReactNode;
  iconBg: string;
  badgeBg: string;
  buttonBg: string;
}> = [
  {
    match: /vip|top|high/i,
    icon: <Crown className="w-4 h-4" />,
    iconBg: "bg-violet-100 text-violet-600",
    badgeBg: "bg-violet-100 text-violet-700",
    buttonBg: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  },
  {
    match: /frequent|loyal/i,
    icon: <Star className="w-4 h-4" />,
    iconBg: "bg-warning-2 text-warning-1",
    badgeBg: "bg-warning-2 text-warning-1",
    buttonBg: "bg-warning-2 text-warning-1 hover:bg-warning-2/70",
  },
  {
    match: /new/i,
    icon: <Users className="w-4 h-4" />,
    iconBg: "bg-info-2 text-info-1",
    badgeBg: "bg-info-2 text-info-1",
    buttonBg: "bg-info-2 text-info-1 hover:bg-info-2/70",
  },
  {
    match: /risk|churn|lapsing/i,
    icon: <AlertCircle className="w-4 h-4" />,
    iconBg: "bg-error-2 text-error-1",
    badgeBg: "bg-error-2 text-error-1",
    buttonBg: "bg-error-2 text-error-1 hover:bg-error-2/70",
  },
  {
    match: /inactive|dormant|lost/i,
    icon: <RotateCcw className="w-4 h-4" />,
    iconBg: "bg-grey-6 text-grey-3",
    badgeBg: "bg-grey-6 text-grey-3",
    buttonBg: "bg-grey-6 text-grey-3 hover:bg-grey-5",
  },
];

const FALLBACK_TONE = {
  icon: <Heart className="w-4 h-4" />,
  iconBg: "bg-success-2 text-success-1",
  badgeBg: "bg-success-2 text-success-1",
  buttonBg: "bg-success-2 text-success-1 hover:bg-success-2/70",
};

const toneFor = (segment: CustomerSegment) => {
  const haystack = `${segment.segment_type ?? ""} ${segment.name ?? ""}`;
  return (
    TONE_BY_KEYWORD.find((entry) => entry.match.test(haystack)) ?? FALLBACK_TONE
  );
};

const SegmentCard = ({
  segment,
  onView,
  onChanged,
}: {
  segment: CustomerSegment;
  onView: () => void;
  onChanged: () => void;
}) => {
  const tone = toneFor(segment);
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
    <div className="bg-white rounded-2xl border border-grey-5 p-4">
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

      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-base font-extrabold text-grey-1 truncate">
          {segment.name}
        </h3>
        {segment.is_default && (
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-grey-6 text-grey-3">
            Default
          </span>
        )}
        {!isActive && (
          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-error-2 text-error-1">
            Paused
          </span>
        )}
      </div>

      <p className="text-[11px] text-grey-3 mb-3 truncate">
        {segment.segment_type ?? "Custom segment"}
        {segment.match_type ? ` · matches ${segment.match_type}` : ""}
      </p>

      <button
        onClick={onView}
        className={cn(
          "w-full flex items-center justify-center gap-1 py-2 rounded-full text-sm font-bold cursor-pointer transition-colors",
          tone.buttonBg,
        )}
      >
        View Customers
        <span aria-hidden>→</span>
      </button>

      <div className="flex items-center justify-end gap-1 mt-2">
        <button
          onClick={() => updateSegment({ is_active: !isActive })}
          disabled={toggling || !segment.id}
          title={isActive ? "Pause segment" : "Resume segment"}
          className="p-1.5 rounded-lg text-grey-3 hover:bg-grey-6 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {toggling ? (
            <Spinner className="w-3.5 h-3.5" />
          ) : isActive ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>
        {/* Default segments are seeded by the backend and cannot be removed. */}
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
          Customer segments for this business. Click a segment to view its
          customers.
        </p>
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
      )}

      <CustomModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        trigger={false}
        title={selected?.name ?? "Segment"}
      >
        <div className="w-full">
          {selected?.id && <SegmentCustomers segmentId={selected.id} />}
        </div>
      </CustomModal>
    </div>
  );
};

export default CustomerSegments;
