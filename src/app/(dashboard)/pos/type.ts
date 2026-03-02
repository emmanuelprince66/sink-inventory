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
