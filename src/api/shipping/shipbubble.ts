import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

// ─── Box-size presets ───────────────────────────────────────────────────────
// Pulled from GET /order/shipping_dimention/. The Shipbubble setup modal
// shows these as pickable tiles (Envelope, Flyer, Small Box, etc.).

export interface BoxSizeOption {
  name: string;
  description_image_url: string;
  /** Numeric in the API but occasionally returned as a string — coerce when reading. */
  height: number | string;
  width: number | string;
  length: number | string;
  max_weight: number | string;
}

interface BoxSizesResponse {
  success: boolean;
  data: BoxSizeOption[];
  message: string;
}

export const fetchBoxSizes = async (): Promise<BoxSizesResponse> => {
  const response = await fetch("/api/order/shipping_dimention", {
    method: "GET",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch box sizes");
  }
  return response.json();
};

type BoxSizesFn = typeof fetchBoxSizes;

export const useFetchBoxSizesQuery = (
  config?: QueryConfigType<BoxSizesFn>,
) =>
  useQuery<ExtractFnReturnType<BoxSizesFn>>({
    queryKey: [queryKey.shipping.getBoxSizes],
    queryFn: fetchBoxSizes,
    staleTime: 1000 * 60 * 60, // 1 hour — box sizes rarely change
    ...config,
  });

// ─── Shipping categories ────────────────────────────────────────────────────

export interface ShippingCategoryOption {
  category_id: number;
  category: string;
}

interface CategoriesResponse {
  success: boolean;
  data: ShippingCategoryOption[];
  message: string;
}

export const fetchShippingCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetch("/api/order/shipping_category", {
    method: "GET",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch shipping categories");
  }
  return response.json();
};

type CategoriesFn = typeof fetchShippingCategories;

export const useFetchShippingCategoriesQuery = (
  config?: QueryConfigType<CategoriesFn>,
) =>
  useQuery<ExtractFnReturnType<CategoriesFn>>({
    queryKey: [queryKey.shipping.getShippingCategories],
    queryFn: fetchShippingCategories,
    staleTime: 1000 * 60 * 60,
    ...config,
  });
