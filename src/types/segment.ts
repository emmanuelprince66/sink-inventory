// types/segment.ts
// Shapes for /customer/segment/* — see the Sync360 spec.

/**
 * The spec collapses this enum to "Array [ 7 ]" without listing the members,
 * so the union below is left open. Narrow it once the real values are known —
 * the UI already keys its icon/tone lookup off this string.
 */
export type SegmentType = string;

/** Spec shows "Array [ 2 ]"; ALL/ANY is the conventional pair for a rule set. */
export type MatchType = string;

/**
 * The spec types this as a bare object with no properties, so the condition
 * builder cannot be generated from it. Kept opaque and passed through
 * untouched rather than guessed at.
 */
export type SegmentConditions = Record<string, unknown>;

export interface CustomerSegment {
  id?: string;
  name: string;
  segment_type?: SegmentType;
  match_type?: MatchType;
  /** Read-only: default segments are seeded by the backend on first GET. */
  is_default?: boolean;
  is_active?: boolean;
  conditions?: SegmentConditions;
  /** Read-only, and a string rather than a number in the spec. */
  customer_count?: string;
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
