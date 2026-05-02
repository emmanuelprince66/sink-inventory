import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

type FetchInventoryProps = {
  id: string;
  category_id?: string | null;
  department_id?: string | null;
  type?: string;
  search?: string | null;
  page?: number;
  limit?: number;
  allow_tax?: boolean;
  include_raw_material?: boolean;
  sell_online?: boolean;
  in_house?: boolean;
  raw_material?: boolean;
  watchlist?: boolean;
};

export const fetchInventory = async ({
  id,
  search = "",
  type = "",
  category_id = "",
  department_id = "",
  page = 1,
  limit = 20,
  allow_tax,
  sell_online,
  include_raw_material,
  in_house,
  raw_material,
  watchlist,
}: FetchInventoryProps) => {
  const url = new URL(`/api/inventory/${id}`, window.location.origin);
  if (search) url.searchParams.append("search", search);
  if (type) url.searchParams.append("type", type);
  if (category_id) url.searchParams.append("category_id", category_id);
  if (department_id) url.searchParams.append("department_id", department_id);
  if (allow_tax !== undefined)
    url.searchParams.append("allow_tax", String(allow_tax));
  if (sell_online !== undefined)
    url.searchParams.append("sell_online", String(sell_online));
  if (in_house !== undefined)
    url.searchParams.append("in_house", String(in_house));
  if (raw_material !== undefined)
    url.searchParams.append("raw_material", String(raw_material));
  if (watchlist !== undefined)
    url.searchParams.append("watchlist", String(watchlist));
  if (include_raw_material !== undefined)
    url.searchParams.append(
      "include_raw_material",
      String(include_raw_material),
    );
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
    queryKey: [
      queryKey.inventory.getAllInventory,
      params.id,
      params.search,
      params.type,
      params.category_id,
      params.department_id,
      params.page,
      params.limit,
      params.allow_tax,
      params.sell_online,
      params.in_house,
      params.raw_material,
      params.watchlist,
      params.include_raw_material,
    ],
    queryFn: () => fetchInventory(params),
    ...config,
  });
};
