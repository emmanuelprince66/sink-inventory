// types/segment.ts
// Shapes for /customer/segment/* — see the Sync360 spec.

/**
 * Verified against a live response: SCREAMING_SNAKE members such as
 * INACTIVE_CUSTOMERS and FREQUENT_BUYERS. Left as a widened union so an
 * unlisted member from the backend still type-checks rather than breaking the
 * page — the spec only ever said "Array [ 7 ]".
 */
export type SegmentType =
  | "VIP_CUSTOMERS"
  | "FREQUENT_BUYERS"
  | "NEW_CUSTOMERS"
  | "AT_RISK"
  | "INACTIVE_CUSTOMERS"
  | "REGULAR_BUYERS"
  | "CUSTOM"
  | (string & {});

/** Confirmed live: "ALL". ANY is the other half of the two-member enum. */
export type MatchType = "ALL" | "ANY" | (string & {});

/**
 * A flat map of rule name → threshold, verified live:
 *   { no_purchase_days: 30 }
 *   { purchases: 4, within_days: 30 }
 * Values are numeric in every observed case, but the map is left open because
 * the spec publishes no properties at all for this object.
 */
export type SegmentConditions = Record<string, number | string | boolean>;

/**
 * Condition keys seen in live default segments, plus the labels and units the
 * editor renders. Unknown keys returned by the backend still round-trip — the
 * editor falls back to a humanised version of the raw key.
 */
export const CONDITION_FIELDS: Array<{
  key: string;
  label: string;
  suffix?: string;
}> = [
  { key: "purchases", label: "Number of purchases" },
  { key: "within_days", label: "Within the last", suffix: "days" },
  { key: "no_purchase_days", label: "No purchase for", suffix: "days" },
  { key: "min_spend", label: "Minimum total spend" },
  { key: "visits", label: "Number of visits" },
];

/** "no_purchase_days" → "No purchase days" for keys not in the list above. */
export const humaniseConditionKey = (key: string) =>
  key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export interface CustomerSegment {
  id?: string;
  name: string;
  segment_type?: SegmentType;
  match_type?: MatchType;
  /** Read-only: default segments are seeded by the backend on first GET. */
  is_default?: boolean;
  is_active?: boolean;
  conditions?: SegmentConditions;
  /** Read-only. The spec types this as a string; live responses send a number. */
  customer_count?: number | string;
  /** Read-only. Total revenue from everyone currently in the segment. */
  revenue?: number | string;
  /** Read-only. Share of the segment that has bought more than once. */
  repeat_rate?: number | string;
  /** Read-only. Average basket across the segment. */
  avg_spend?: number | string;
  created_at?: string;
  updated_at?: string;
}

/** Payload for POST/PATCH — read-only fields omitted. */
export interface CustomerSegmentPayload {
  name: string;
  segment_type?: SegmentType;
  match_type?: MatchType;
  is_active?: boolean;
  conditions?: SegmentConditions;
}

export interface CustomerAddress {
  id?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string | null;
  latitude?: string;
  longitude?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface UserCustomer {
  id?: string;
  name: string;
  phone: string;
  wallet?: number;
  email?: string;
  profile_pic?: string;
  sales_count?: number;
  /** Decimal string, e.g. "12500.00". */
  total_sales?: string;
  addresses?: CustomerAddress[];
  address?: CustomerAddress;
}
