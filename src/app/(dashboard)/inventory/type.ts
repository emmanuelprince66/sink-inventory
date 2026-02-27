export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  category: string;
  cost_price?: number;
  selling_price: number;
  department?: string;
  quantity: number;
  watchlist: boolean;
  sold: number;
  sku?: string | null;
  status: "IN-STOCK" | "LOW" | "OUT-OF-STOCK" | string; // Add other possible status values
  type: "PRODUCT" | "SERVICE" | string; // Add other possible types
  description?: string | null;
  amount?: number; // For services
}

export interface InventoryLinks {
  next: string | null;
  previous: string | null;
}

export interface InventoryPagination {
  limit: number;
  pages: number;
  total: number;
  links: InventoryLinks;
}

export interface InventorySummary {
  inventory_value: number;
  profit: number;
  selling_price: number;
}

export interface InventoryResponse {
  success: boolean;
  message: string;
  data: {
    results: {
      data: InventoryItem[];
    };
    inventory_value: number;
    profit: number;
    selling_price: number;
    total: number;
  } & InventoryPagination;
}

// Alternative more detailed structure if you prefer
export interface DetailedInventoryResponse {
  success: boolean;
  message: string;
  data: {
    limit: number;
    links: InventoryLinks;
    pages: number;
    results: {
      data: InventoryItem[];
    };
    inventory_value: number;
    profit: number;
    selling_price: number;
    total: number;
  };
}
