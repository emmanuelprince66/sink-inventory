import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { DateRange } from "react-day-picker";

export type RestockHistoryItem = {
  name: string;
  sku: string | null;
  quantity: string;
  date: string;
  user: {
    id: string;
    name: string;
  };
  remark: string | null;
};

export type RestockHistoryResponse = {
  links: {
    next: string | null;
    previous: string | null;
  };
  total: number;
  limit: number;
  pages: number;
  results: RestockHistoryItem[];
};

type FetchAllRestockHistoryParams = {
  id: string;
  search?: string;
  dateRange?: DateRange;
  user?: string;
  page?: number;
  limit?: number;
};

export const fetchAllRestockHistory = async ({
  id,
  search = "",
  dateRange,
  user = "",
  page = 1,
  limit = 10,
}: FetchAllRestockHistoryParams): Promise<RestockHistoryResponse> => {
  const url = new URL(
    `/api/restock/${id}/fetch-all-history`,
    window.location.origin,
  );

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (dateRange?.from) params.append("start_date", formatDate(dateRange.from));
  if (dateRange?.to) params.append("end_date", formatDate(dateRange.to));
  if (user) params.append("user", user);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching restock history",
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

type QueryFnType = typeof fetchAllRestockHistory;

type UseFetchAllRestockHistoryProps = QueryConfigType<QueryFnType> & {
  params: FetchAllRestockHistoryParams;
};

export const useFetchAllRestockHistoryQuery = ({
  params,
  ...config
}: UseFetchAllRestockHistoryProps) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      queryKey.products.fetchAllRestockHistory,
      params.id,
      params.search,
      params.dateRange,
      params.user,
      params.page,
      params.limit,
    ],
    queryFn: () => fetchAllRestockHistory(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
