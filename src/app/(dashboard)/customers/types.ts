export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CustomerType {
  id: string;
  name: string;
  phone: string;
  wallet: number;
  email: string;
  profile_pic: string | null | any;
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
