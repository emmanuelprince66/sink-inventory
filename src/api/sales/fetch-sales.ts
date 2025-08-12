import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

type fetchSalesHistoryProps = {
  id: string;
  type?: string;
  search?: string;
  attendance_id?: string;
  category_id?: any;

  start_date?: string;
  end_date?: string;
};

export const fetchSalesHistory = async ({
  id,
  search = "",
  type = "",
  start_date = "",
  end_date = "",
  category_id = "",

  attendance_id = "",
}: fetchSalesHistoryProps) => {
  console.log("category_id--22", category_id);
  const url = new URL(`/api/sales/${id}`, window.location.origin);

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  if (category_id) params.append("category_id", category_id);
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  if (attendance_id) params.append("attendance_id", attendance_id);

  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("response----4455775", response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Error fetching sales history data"
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchSalesHistory;

type useFectchSalesHistoryOptions = QueryConfigType<QueryFnType> & {
  params: fetchSalesHistoryProps;
};

export const useFetchSalesHistoryQuery = ({
  params,
  ...config
}: useFectchSalesHistoryOptions) => {
  const { mutate: logout, isPending } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      console.log("error---------5", error);
      console.log("error---------599999", error.status);

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
      queryKey.sales.getAllSalesHistory,
      params.id,
      params.search,
      params.type,
      params.start_date,
      params.end_date,
      params.category_id,
      params.attendance_id,
    ],
    queryFn: () => fetchSalesHistory(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
