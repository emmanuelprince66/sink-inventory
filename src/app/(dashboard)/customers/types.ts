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
