export interface CartItem {
  id: string;
  name: string;
  image: string;
  selling_price: number;
  cartQuantity: number;
  quantity: number;
  status: string;
  amount?: number;
  category: string;
  cost_price: number;
  discount: number;
  discount_threshold: number | null;
  sku: string | null;
  sold: number;
  type: string;
}
