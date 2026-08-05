export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CustomerAddress {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  /** Resolved once when the customer is created, then reused on every order
   * instead of re-geocoding the same address. Nullable because customers
   * created before the backend added these fields won't have them — the
   * order form falls back to its autocomplete / city-centroid chain.
   * API caps these at 15 chars; we emit 6dp, so max is 11 (e.g. "-179.123456"). */
  latitude: string | null;
  longitude: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CustomerType {
  id: string;
  name: string;
  phone: string;
  total_sales: number;
  sales_count: number;
  wallet: number;
  email: string;
  profile_pic: string | null | any;
  addresses?: CustomerAddress[];
}

export interface CustomerSummary {
  total_debt: number;
  total_wallet: number;
  customer_count: number;
  data: CustomerType[];
}

export interface CustomerResponse {
  links: {
    next: string | null;
    previous: string | null;
  };
  total: number;
  limit: number;
  pages: number;
  results: CustomerSummary;
}

export interface CustomerHistoryProps {
  data: CustomerHistoryData[];
  message: string;
  success: boolean;
}

interface CustomerHistoryProductsProps {
  image: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerHistoryData {
  attendance: string;
  attendant: string;
  balance: string;
  created_at: string;
  id: string;
  method: string;
  payment_status: string;
  products: CustomerHistoryProductsProps[];
  total_price: string;
}

export interface CustomerWalletTrxProps {
  data: CustomerWalletTrxData[];
  message: string;
  success: boolean;
}

export interface CustomerWalletTrxData {
  amount: number;
  attendance: string;
  balance: number;
  created_at: string;
  id: string;
  initial: number;
  note: any;
  payment_method: string;
  type: string;
}
