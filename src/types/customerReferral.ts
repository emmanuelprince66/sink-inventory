/**
 * Customer referral programmes — /referral/customer-programmes/.
 *
 * Distinct from the existing business referral feature under src/api/referral:
 * this is a merchant rewarding their own customers for bringing friends in.
 */

export interface CustomerReferralProgramme {
  id: string;
  name: string;
  /** Decimal string, e.g. "5.00" — a percentage of the referred sale. */
  reward_percentage: string;
  /** Maximum number of rewards this programme will ever pay out. */
  reward_cap: number;
  notify_sms?: boolean;
  notify_email?: boolean;
  is_active?: boolean;
  created_at?: string;
  participants_count?: number;
  referrals_count?: number;
  /** Decimal string. */
  total_paid?: string;
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
  /** Decimal string. */
  total_paid_out: string;
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
  /** Decimal string. */
  total_earned?: string;
  created_at?: string;
}

export interface AddReferralParticipant {
  name: string;
  phone: string;
  email?: string | null;
}
