import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

type fetchBankBreakDown = {
  id: string;
  start_date?: string;
  end_date?: string;
  name?: string;
};

export const fetchBankBreakDown = async ({
  id,
  start_date = "",
  end_date = "",
  name = "",
}: fetchBankBreakDown) => {
  const url = new URL(`/api/analytics/${id}/breakdown`, window.location.origin);

  const params = new URLSearchParams();
  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);
  if (name) params.append("name", name);

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
      errorData.message || "Error fetching bank  breakdown data"
    );
    (error as any).type = response.type;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
};

type QueryFnType = typeof fetchBankBreakDown;

type useFetchBankBreakDown = QueryConfigType<QueryFnType> & {
  params: fetchBankBreakDown;
};

export const useFetchBankAnalyticBreakdownQuery = ({
  params,
  ...config
}: useFetchBankBreakDown) => {
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
      if ([404, 401].includes(error.type)) return failureCount < 2;
    },
    queryKey: [
      queryKey.analytics.getBankAnalyticsBreakdown,
      params.id,
      params.start_date,
      params.end_date,
      params.name,
    ],
    queryFn: () => fetchBankBreakDown(params),
    // staleTime: 1000 * 60 * 5, // 5 minutes
    ...config,
  });
};
