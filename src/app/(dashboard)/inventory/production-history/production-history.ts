// api/inventory/fetch-production-history.ts
export interface ProductionHistoryItem {
  product: string;
  created_at: string;
  quantity: string;
  status: "MOVED" | "RECEIVED";
  id: string;
  received_by: string | null;
  note: string;
  move_id: string;
  moved_by: string;
}

export interface ProductionHistoryResponse {
  links: {
    next: string | null;
    previous: string | null;
  };
  total: number;
  limit: number;
  pages: number;
  results: ProductionHistoryItem[];
}
