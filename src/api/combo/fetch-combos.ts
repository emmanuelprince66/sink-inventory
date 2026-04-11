// Type definitions for combo items.
// Combos are fetched via the shared inventory endpoint (type=COMBO),
// so no query function is needed here — only shared types.

export interface ComboItem {
  id: string;
  product: string;
  product_name: string;
  product_image: string | null;
  original_price: number;
  cost_price: number;
  stock: string;
  quantity: number;
  price: number;
}

export interface Combo {
  id: string;
  name: string;
  business: string;
  description: string | null;
  image: string | null;
  image_url: string | null;
  sell_online: boolean;
  items: ComboItem[];
  original_total: number;
  total_cost_price: number;
  combo_selling_price: number;
  created_at: string;
  updated_at: string;
}
