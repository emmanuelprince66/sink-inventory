export interface SalesDataItem {
  name: string;
  unit_sold: number;
  revenue: number;
  profit: number;
  tax: any;
  watchlist?: boolean;
  sku: any;
  discount: number;
}

interface SalesResults {
  revenue: number;
  cost: number;
  orders: number;
  data: SalesDataItem[];
}

export interface SalesHistoryResponse {
  success: boolean;
  data: {
    results: SalesResults;
  };
  message: string;
}

export interface SalesOrderData {
  success: boolean;
  message: string;
  data: {
    limit: number;
    links: {
      next: string | null;
      previous: string | null;
    };
    pages: number;
    results: SalesOrder[];
    total: number;
  };
}

export interface SalesOrder {
  id: string;
  date: string;
  created_at: string;
  pre_sale: string;
  attendant: string;
  payment_status: "PAID" | string; // Add other possible statuses if they exist
  method: "BANK" | "ADVANCE" | string; // Add other payment methods if they exist
  total_price: string;
  products: Product[];
}

interface Product {
  // Add product properties based on the actual data structure
  // Since the product details weren't fully shown in the example,
  // you'll need to complete this based on the actual data
  id: string;
  name: string;
  quantity: number;
  price: string;
  unit_price: string;
  image: string;
  // ... any other product fields
}
