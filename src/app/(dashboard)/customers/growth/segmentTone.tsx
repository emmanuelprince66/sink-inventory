import {
  AlertCircle,
  Crown,
  Heart,
  RotateCcw,
  Star,
  Users,
} from "lucide-react";

/**
 * Per-segment palette from the Figma. Keyed off the live segment_type values
 * (SCREAMING_SNAKE, e.g. INACTIVE_CUSTOMERS) rather than the display name, so
 * a renamed segment keeps its colour. `match` catches custom segments whose
 * type is CUSTOM but whose name still reads "VIP", and is also the reason an
 * unknown type never renders unstyled.
 */
export interface SegmentTone {
  icon: React.ReactNode;
  /** Circular icon chip, top-left of the card. */
  iconBg: string;
  /** "12 customers" pill, top-right. */
  badgeBg: string;
  /** Full-width "View Customers" button. */
  buttonBg: string;
}

const TONES: Record<string, SegmentTone> = {
  VIP_CUSTOMERS: {
    icon: <Crown className="w-4 h-4" />,
    iconBg: "bg-violet-100 text-violet-600",
    badgeBg: "bg-violet-100 text-violet-700",
    buttonBg: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  },
  FREQUENT_BUYERS: {
    icon: <Star className="w-4 h-4" />,
    iconBg: "bg-amber-100 text-amber-600",
    badgeBg: "bg-amber-100 text-amber-700",
    buttonBg: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
  NEW_CUSTOMERS: {
    icon: <Users className="w-4 h-4" />,
    iconBg: "bg-sky-100 text-sky-600",
    badgeBg: "bg-sky-100 text-sky-700",
    buttonBg: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  },
  AT_RISK: {
    icon: <AlertCircle className="w-4 h-4" />,
    iconBg: "bg-rose-100 text-rose-600",
    badgeBg: "bg-rose-100 text-rose-700",
    buttonBg: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  },
  INACTIVE_CUSTOMERS: {
    icon: <RotateCcw className="w-4 h-4" />,
    iconBg: "bg-grey-6 text-grey-3",
    badgeBg: "bg-grey-6 text-grey-3",
    buttonBg: "bg-grey-6 text-grey-2 hover:bg-grey-5",
  },
  REGULAR_BUYERS: {
    icon: <Heart className="w-4 h-4" />,
    iconBg: "bg-emerald-100 text-emerald-600",
    badgeBg: "bg-emerald-100 text-emerald-700",
    buttonBg: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
};

// Ordered: first pattern to match wins, so AT_RISK is tested before the
// looser "regular"/custom fallback.
const NAME_FALLBACKS: Array<{ match: RegExp; tone: string }> = [
  { match: /vip|top spend|high value/i, tone: "VIP_CUSTOMERS" },
  { match: /frequent|loyal/i, tone: "FREQUENT_BUYERS" },
  { match: /new/i, tone: "NEW_CUSTOMERS" },
  { match: /risk|churn|lapsing/i, tone: "AT_RISK" },
  { match: /inactive|dormant|lost/i, tone: "INACTIVE_CUSTOMERS" },
  { match: /regular|repeat/i, tone: "REGULAR_BUYERS" },
];

export const toneFor = (
  segmentType?: string,
  name?: string,
): SegmentTone => {
  if (segmentType && TONES[segmentType]) return TONES[segmentType];

  const haystack = `${segmentType ?? ""} ${name ?? ""}`;
  const fallback = NAME_FALLBACKS.find((f) => f.match.test(haystack));
  if (fallback) return TONES[fallback.tone];

  return TONES.REGULAR_BUYERS;
};
