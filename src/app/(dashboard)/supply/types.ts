export interface SupplierResponse {
  success: boolean;
  data: {
    links: {
      next: string | null;
      previous: string | null;
    };
    total: number;
    limit: number;
    pages: number;
    results: {
      wallet_balance: number;
      debt: number;
      supplier_count: number;
      data: Supplier[];
    };
  };
  message: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  wallet: number;
  supply_history: SupplyHistory[];
}

export interface SupplyHistory {
  id: string;
  status: "PAID" | string; // Assuming other possible statuses might exist
  created_at: string;
  quantity: number;
  cost_price: number;
  name: string;
  supplier: string;
}
