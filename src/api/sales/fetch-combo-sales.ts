import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

/**
 * Combo sales — /sale/combos/summary/{business_id}/ and
 * /sale/combos/detail/{combo_id}/.
 *
 * Neither endpoint publishes a response schema, so nothing here assumes one.
 * Each field is read through a list of plausible names and the first hit wins;
 * a rename on the backend degrades to a blank cell instead of `undefined`
 * rendering as "NaN" or the table throwing. Once a real response is confirmed
 * this should collapse to the actual field names — the tolerance is scaffolding,
 * not a design.
 */

export interface ComboSaleItem {
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

export interface ComboSale {
  id: string;
  combo_name: string;
  combo_image: string | null;
  quantity: number;
  selling_price: number;
  items: ComboSaleItem[];
  sold_at: string;
}

const str = (source: any, names: string[], fallback = ""): string => {
  for (const name of names) {
    const value = source?.[name];
    if (value !== undefined && value !== null && value !== "")
      return String(value);
  }
  return fallback;
};

const num = (source: any, names: string[]): number => {
  for (const name of names) {
    const value = source?.[name];
    if (value !== undefined && value !== null && value !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
};

const nullableStr = (source: any, names: string[]): string | null =>
  str(source, names) || null;

const arr = (source: any, names: string[]): any[] => {
  for (const name of names) {
    if (Array.isArray(source?.[name])) return source[name];
  }
  return [];
};

export const normaliseComboItem = (raw: any): ComboSaleItem => ({
  product_name: str(raw, [
    "product_name",
    "name",
    "product",
    "item_name",
    "service_name",
  ]),
  product_image: nullableStr(raw, [
    "product_image",
    "image",
    "image_url",
    "thumbnail",
  ]),
  quantity: num(raw, ["quantity", "qty", "count"]),
  price: num(raw, ["price", "unit_price", "amount", "selling_price"]),
});

export const normaliseComboSale = (raw: any): ComboSale => ({
  id: str(raw, ["id", "combo_id", "sale_id", "uuid"]),
  combo_name: str(raw, ["combo_name", "name", "title"]),
  combo_image: nullableStr(raw, [
    "combo_image",
    "image",
    "image_url",
    "thumbnail",
  ]),
  // "How many of this combo went out" — the single most likely field to be
  // named differently, so it gets the widest net.
  quantity: num(raw, [
    "quantity",
    "quantity_sold",
    "total_quantity",
    "total_sold",
    "sales_count",
    "count",
  ]),
  selling_price: num(raw, [
    "selling_price",
    "price",
    "total_amount",
    "total_sales",
    "amount",
    "revenue",
  ]),
  items: arr(raw, ["items", "products", "combo_items", "details"]).map(
    normaliseComboItem,
  ),
  sold_at: str(raw, [
    "sold_at",
    "last_sold_at",
    "created_at",
    "date",
    "updated_at",
  ]),
});

/** The payload may be a bare array, a paginated envelope, or {data:[...]}. */
const toRows = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  for (const key of ["results", "data", "combos", "summary"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

// ─── Summary ────────────────────────────────────────────────────────────────

export type FetchComboSalesParams = {
  businessId: string;
  start_date?: string;
  end_date?: string;
};

export const fetchComboSales = async ({
  businessId,
  ...params
}: FetchComboSalesParams): Promise<ComboSale[]> => {
  const url = new URL(
    `/api/sales/combos/summary/${businessId}`,
    window.location.origin,
  );
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  const body = await response.json();
  return toRows(body?.data).map(normaliseComboSale);
};

export const useFetchComboSalesQuery = ({
  params,
  ...config
}: QueryConfigType<typeof fetchComboSales> & {
  params: FetchComboSalesParams;
}) =>
  useQuery<ExtractFnReturnType<typeof fetchComboSales>>({
    queryKey: [
      queryKey.sales.getComboSales,
      params.businessId,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => fetchComboSales(params),
    enabled: Boolean(params.businessId),
    ...config,
  });

// ─── Detail ─────────────────────────────────────────────────────────────────

export const fetchComboSaleDetail = async (
  comboId: string,
): Promise<ComboSale | null> => {
  const response = await fetch(`/api/sales/combos/detail/${comboId}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) return null;

  const body = await response.json();
  const payload = body?.data;
  // Detail may come back as the object itself or wrapped like the summary.
  const row = Array.isArray(payload) ? payload[0] : (toRows(payload)[0] ?? payload);
  return row ? normaliseComboSale(row) : null;
};

export const useFetchComboSaleDetailQuery = ({
  comboId,
  ...config
}: QueryConfigType<typeof fetchComboSaleDetail> & { comboId: string }) =>
  useQuery<ExtractFnReturnType<typeof fetchComboSaleDetail>>({
    queryKey: [queryKey.sales.getComboSaleDetail, comboId],
    queryFn: () => fetchComboSaleDetail(comboId),
    enabled: Boolean(comboId),
    ...config,
  });
