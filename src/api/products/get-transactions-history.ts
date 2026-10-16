import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

export type ProductTransactionItem = {
  created_at: string;
  type: string;
  direction: "in" | "out";
  new_quantity: number;
  quantity_change: string;
  processor: string | null;
  reversed_at: string | null;
  reversed_by: string | null;
  batch_number: string | null;
  note: string | null;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
};

export type ProductTransactionVariation = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
};

export type ProductTransactionResults = {
  name: string;
  category: string;
  quantity: string;
  purchase: string;
  initial_stock: string;
  restocked: string;
  sold: string;
  transfer_in: string;
  transfer_out: string;
  returned: string;
  damaged: string;
  waste: string;
  move_to_prod: string;
  selected_variant_id: string | null;
  variations: ProductTransactionVariation[];
  data: ProductTransactionItem[];
};

export type ProductTransactionPayload = {
  links: {
    next: string | null;
    previous: string | null;
  };
  total: number;
  limit: number;
  pages: number;
  results: ProductTransactionResults;
};

export type ProductTransactionQueryResponse = {
  success: boolean;
  data: ProductTransactionPayload;
  message: string;
};

type FetchProductTransactionsData = {
  id: string;
  page?: number;
  limit?: number;
  variant_id?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
};

export const FetchProductTransactions = async ({
  id,
  page = 1,
  limit = 10,
  variant_id,
  type,
  start_date,
  end_date,
}: FetchProductTransactionsData) => {
  const url = new URL(
    `/api/products/${id}/transactions`,
    window.location.origin
  );

  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());
  if (variant_id) url.searchParams.append("variant_id", variant_id);
  if (type) url.searchParams.append("type", type);
  if (start_date) url.searchParams.append("start_date", start_date);
  if (end_date) url.searchParams.append("end_date", end_date);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching product transaction history");
    (error as any).status = response.status;
    throw error;
  }

  return response.json() as Promise<ProductTransactionQueryResponse>;
};

type QueryFnType = typeof FetchProductTransactions;

type useGetProductTransactionProps = QueryConfigType<QueryFnType> & {
  params: FetchProductTransactionsData;
};

export const useFetchProductTransactionsQuery = ({
  params,
  ...config
}: useGetProductTransactionProps) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key
    queryKey: [
      queryKey.products.transactionsHistory,
      params.id,
      params.variant_id,
      params.page,
      params.limit,
      params.type,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => FetchProductTransactions(params),
    ...config,
  });
};
