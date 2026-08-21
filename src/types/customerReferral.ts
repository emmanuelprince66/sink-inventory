/**
 * Customer referral programmes — /referral/customer-programmes/.
 *
 * Distinct from the existing business referral feature under src/api/referral:
 * this is a merchant rewarding their own customers for bringing friends in.
 */

/**
 * The spec types every money field as $decimal (a string), but the live API
 * returns total_paid as a bare 0 on a programme that has paid nothing. Both
 * shapes are accepted here rather than trusting one — every read goes through
 * Number() anyway, so "0.00" and 0 land in the same place.
 */
export type Decimal = string | number;

export interface CustomerReferralProgramme {
  id: string;
  name: string;
  /** Percentage of the referred sale, e.g. "5.00". */
  reward_percentage: Decimal;
  /** Maximum number of rewards this programme will ever pay out. */
  reward_cap: number;
  notify_sms?: boolean;
  notify_email?: boolean;
  is_active?: boolean;
  created_at?: string;
  participants_count?: number;
  referrals_count?: number;
  total_paid?: Decimal;
  /** Pre-formatted "used/cap", e.g. "12/50". */
  cap_progress?: string;
}

export interface CustomerReferralProgrammeCreate {
  name: string;
  reward_percentage: string;
  reward_cap: number;
  notify_sms?: boolean;
  notify_email?: boolean;
}

export type CustomerReferralProgrammeUpdate =
  Partial<CustomerReferralProgrammeCreate> & { is_active?: boolean };

export interface CustomerReferralOverview {
  total_programmes: number;
  total_participants: number;
  total_referrals: number;
  total_paid_out: Decimal;
  /** Multiplier, e.g. 2.8. */
  conversion_rate: number;
  /** Already formatted, e.g. "2.8×". */
  conversion_rate_formatted: string;
}

export interface CustomerReferralParticipant {
  id: string;
  code: string;
  customer_name?: string;
  initials?: string;
  phone?: string;
  referral_link?: string;
  referrals_count?: number;
  paid_count?: number;
  total_earned?: Decimal;
  created_at?: string;
}

export interface AddReferralParticipant {
  name: string;
  phone: string;
  email?: string | null;
}
