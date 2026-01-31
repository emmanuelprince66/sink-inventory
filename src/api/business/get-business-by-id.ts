import { queryKey } from "@/constants/query-key";
import {
  ExtractFnReturnType,
  QueryConfigType,
  useQuery,
} from "@/lib/react-query";
import { useLogoutMutation } from "../auth/logout-user";

export const fetchBusinessById = async (id: string) => {
  // console.log("useQuery:", useQuery); //
  const response = await fetch(`/api/businesses/${id}/business-by-id`);
  if (!response.ok) throw new Error("Error fetching form data");
  return response.json();
};

type QueryFnType = typeof fetchBusinessById;

type options = QueryConfigType<QueryFnType>;

export const useFetchBusinessById = (id: any, config?: options) => {
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
      if ([404, 401].includes(error.status)) return false;
      else if (failureCount < 1) return true;
      else return false;
    },
    queryKey: [queryKey.business.getBusinessById, id],
    queryFn: () => fetchBusinessById(id),
    // staleTime: 1000 * 60 * 5,
    staleTime: 30 * 1000, // 30 seconds – very forgiving
    gcTime: 5 * 60 * 1000,
    ...config,
  });
};
