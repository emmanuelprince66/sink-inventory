// Type definitions for POS system

export interface Variation {
  id: string;
  name: string;
  sku: string;
  status: string;
  selling_price: number;
  quantity: number;
  cost_price?: number;
  discount?: number;
  discount_threshold?: number;
  expiry_date?: string;
  low_stock_threshold?: number;
  sold?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  status: string;
  selling_price?: number;
  amount?: number;
  quantity?: number;
  image?: string;
  type: string;
  category?: string;
  variations?: Variation[];
  unit?: string;
  discount?: number;
  discount_threshold?: number;
  cost_price?: number;
  expiry_date?: string;
  low_stock_threshold?: number;
  sold?: number;
}

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  status: string;
  selling_price?: number;
  allow_tax?: boolean;
  amount?: number;
  quantity?: number;
  cartQuantity: number;
  image?: string;
  type?: string;
  category?: string;
  discount?: number;
  discount_threshold?: number;
  // Variation-specific fields
  parentProductId?: string;
  parentProductName?: string;
  parentProductVariations?: Variation[];
  // Other optional fields
  cost_price?: number;
  expiry_date?: string;
  low_stock_threshold?: number;
  sold?: number;
  unit?: string;
  // Loyalty redemption. A reward puts its free product or service in the cart
  // as its own line so the cashier hands over something they can see, rather
  // than a discount that only appears at the total.
  /** True on the line a loyalty reward added. */
  isReward?: boolean;
  /** The reward being redeemed — goes up as loyalty_reward_id on the sale. */
  rewardId?: string;
  /** What to call the reward on screen, e.g. "Free coffee after 5 visits". */
  rewardLabel?: string;
  /**
   * Inventory id of the product or service this line sells. Only a reward line
   * sets it: its `id` is synthetic, so that the same product bought AND won
   * stays two separate lines instead of merging into one. Everything that
   * talks to the API reads `productId ?? id`.
   */
  productId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Attendant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface DiscountInfo {
  totalItemDiscount: number;
  perUnitDiscount: number;
}
