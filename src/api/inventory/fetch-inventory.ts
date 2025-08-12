import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

type FetchInventoryProps = {
  id: string;
  category_id?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchInventory = async ({
  id,
  search = "",
  type = "",
  category_id = "",
  page = 1,
  limit = 20,
}: FetchInventoryProps) => {
  const url = new URL(`/api/inventory/${id}`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (type) url.searchParams.append("type", type);
  if (category_id) url.searchParams.append("category_id", category_id);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = new Error("Error fetching inventory data");
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
  const { mutate: logout, isPending } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if (error.status === 401) {
        logout();
        console.log("isPending", isPending);
      }
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
      params.page,
      params.limit,
    ],
    queryFn: () => fetchInventory(params),
    ...config,
  });
};
