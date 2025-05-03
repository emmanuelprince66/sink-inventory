import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";

type FetchInventoryProps = {
  id: string;
  category_id?: string;
  type?: string;
  search?: string;
};

export const fetchInventory = async ({
  id,
  search = "",
  type = "",
  category_id = "",
}: FetchInventoryProps) => {
  // Safely construct URL with search params
  const url = new URL(`/api/inventory/${id}`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (type) url.searchParams.append("type", type);
  if (category_id) url.searchParams.append("category_id", category_id);

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching answers data");
    // Attach status code for retry logic
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchInventory;

type UseGetInventoryProps = QueryConfigType<QueryFnType> & {
  params: FetchInventoryProps;
};

export const useGetInventoryQuery = ({
  params,
  ...config
}: UseGetInventoryProps) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if ([404, 401].includes(error.status)) return false;
      return failureCount < 2;
    },
    // Include all parameters in the query key
    queryKey: [
      queryKey.inventory.getAllInventory,
      params.id,
      params.search,
      params.type,
      params.category_id,
    ],
    queryFn: () => fetchInventory(params),
    ...config,
  });
};
