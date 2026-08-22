/**
 * A customer's transaction ledger — GET /customer/transactions/{id}/.
 *
 * One stream covering five different kinds of event, so `details` is a union of
 * every shape rather than a fixed record: a purchase carries items and tax, a
 * wallet movement carries balances, a debt settlement points back at its sale.
 * Everything on it is optional for that reason — read only what the row's
 * `type` says is there.
 */

export const TRANSACTION_TYPES = [
  "ALL",
  "PURCHASE",
  "WALLET",
  "DEBT",
  "LOYALTY",
  "REFERRAL",
] as const;
export type CustomerTransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_FLOWS = ["INFLOW", "OUTFLOW"] as const;
export type TransactionFlow = (typeof TRANSACTION_FLOWS)[number];

export const TRANSACTION_STATUSES = [
  "SUCCESSFUL",
  "PAID",
  "UNPAID",
  "REVERSED",
  "PENDING",
  "CANCELLED",
] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export interface CustomerTransactionSummary {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  tier?: string | null;
  wallet_balance: number;
  outstanding_debt: number;
  /**
   * Money movement, not spend. An earlier revision of this endpoint returned
   * lifetime_spent / total_spent / reward_points / total_purchases; those were
   * replaced, so nothing here should be read as a spend figure — that lives on
   * the customer detail's purchase_behaviour.
   */
  total_funded?: number;
  total_withdrawn?: number;
  total_repayments?: number;
  total_transactions?: number;
}

export interface CustomerTransactionItemDetails {
  // Purchase
  channel?: string;
  items_count?: number;
  items?: Array<Record<string, any>>;
  total_tax?: number;
  loyalty_discount?: number;
  loyalty_reward_applied?: Record<string, any> | null;
  // Debt
  balance_outstanding?: number;
  due_date?: string | null;
  sale_id?: string;
  sale_reference?: string;
  sale_total_price?: number;
  sale_balance_remaining?: number;
  // Wallet
  initial_balance?: number;
  new_balance?: number;
  note?: string | null;
  bank_name?: string | null;
  // Loyalty
  program_name?: string;
  reward_type?: string;
  value?: number;
  applied_value?: number;
  expires_at?: string | null;
  // Referral
  referred_customer_name?: string;
}

export interface CustomerTransactionItem {
  id: string;
  /** PURCHASE | WALLET | DEBT | LOYALTY | REFERRAL — never ALL, which is a filter. */
  type: Exclude<CustomerTransactionType, "ALL"> | string;
  title: string;
  reference?: string | null;
  amount: number;
  flow: TransactionFlow | string;
  payment_method?: string | null;
  payment_status?: string | null;
  status: TransactionStatus | string;
  attendant?: string | null;
  created_at: string;
  details: CustomerTransactionItemDetails;
}

export interface CustomerTransactionsResponse {
  summary: CustomerTransactionSummary;
  total: number;
  limit: number;
  page: number;
  pages: number;
  results: CustomerTransactionItem[];
}

export interface FetchCustomerTransactionsParams {
  id: string;
  page?: number;
  limit?: number;
  /** Comma-separated is accepted, e.g. "PURCHASE,DEBT". */
  type?: string;
  flow?: TransactionFlow;
  status?: TransactionStatus;
  start_date?: string;
  end_date?: string;
}
