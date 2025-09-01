import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

export const requestReset = async (id: string) => {
  const response = await fetch(`/api/transactions/${id}/request-reset`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof requestReset;

type Options = QueryConfigType<QueryFnType>;

export const useRequestResetPinQuery = (id: any, config?: Options) => {
  const { mutate: logout, isPending } = useLogoutMutation({
    successMessage: "You are not authorized, please login again.",
    redirectPath: "/login?fromLogout=true",
  });

  return useQuery<ExtractFnReturnType<QueryFnType>>({
    retry(failureCount, error: any) {
      if (error.status === 401) {
        logout();
      }
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.transactions.requestReset, id],
    queryFn: () => requestReset(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id, // Only run query if id is provided
    ...config,
  });
};
