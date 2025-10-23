// types.ts

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface OrderInfo {
  id: string;
  channel: string;
  created_by: string;
  customer_info: CustomerInfo;
  note: string | null;
  payment_method: string;
  amount_paid: string;
  payment_status: string;
  amount: string;
  shipping_date: string;
  shipping_fee: string;
  shipping_status: string;
  tax: string;
  type: string;
}

export interface Links {
  next: string | null;
  previous: string | null;
}

export interface Results {
  completed_orders: number;
  data: OrderInfo[];
  order_count: number;
  revenue: number;
  total: number;
}

export interface OrderData {
  limit: number;
  links: Links;
  pages: number;
  results: Results;
}

export interface OrderApiResponse {
  success: boolean;
  data: OrderData;
  message: string;
}
