import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

type fetchProductionHistoryProps = {
  id: string;
  status?: string;
  search?: string;

  start_date?: string;
  end_date?: string;
};

export const fetchProductionHistory = async ({
  id,
  search = "",
  status = "",
  start_date = "",
  end_date = "",
}: fetchProductionHistoryProps) => {
  const url = new URL(
    `/api/products/${id}/fetch-production-history`,
    window.location.origin,
  );

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);

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
      errorData.message || "Error fetching sales history data",
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchProductionHistory;

type useFectchSalesHistoryOptions = QueryConfigType<QueryFnType> & {
  params: fetchProductionHistoryProps;
};

export const useFetchProductionHistoryQuery = ({
  params,
  ...config
}: useFectchSalesHistoryOptions) => {
  const { mutate: logout, isPending } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if (error.status === 401) {
        logout();
        console.log("isPending", isPending);
        // if (!isPending) {
        //   window.location.href = "/login?fromLogout=true";
        // }
        // Force full page reload to reset all state
      }
      if ([404, 401].includes(error.type)) return false;
      return failureCount < 2;
    },
    queryKey: [
      queryKey.products.fetchProductionHistiory,
      params.id,
      params.search,
      params.status,
      params.start_date,
      params.end_date,
    ],
    queryFn: () => fetchProductionHistory(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
