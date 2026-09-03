import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationCallbacks,
  QueryConfigType,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/lib/react-query";
import type { AttendantPermissions } from "@/types/expense-governance";

/** One attendant's role and what they are allowed to do with expense payouts. */

export const fetchAttendantPermissions = async ({ id }: { id: string }) => {
  const response = await fetch(`/api/business/attendant-permissions/${id}`, {
    method: "GET",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

type QueryFnType = typeof fetchAttendantPermissions;

export const useFetchAttendantPermissionsQuery = ({
  params,
  ...config
}: QueryConfigType<QueryFnType> & { params: { id: string } }) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [queryKey.attendants.getPermissions, params],
    queryFn: () => fetchAttendantPermissions(params),
    enabled: Boolean(params.id),
    ...config,
  });

const updateAttendantPermissions = async ({
  id,
  body,
}: {
  id: string;
  body: AttendantPermissions;
}) => {
  const response = await fetch(`/api/business/attendant-permissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw payload;
  return payload;
};

export const useUpdateAttendantPermissionsMutation = (
  config?: MutationCallbacks<typeof updateAttendantPermissions>,
) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    // Spread first: our own onSuccess below must run even when a caller
    // passes one, or the cache invalidation is silently replaced.
    ...config,
    mutationKey: [queryKey.attendants.updatePermissions],
    mutationFn: updateAttendantPermissions,
    retry: false,
    onError: (error: any, variables, context) => {
      showToast(
        error?.details?.message ||
          error?.error ||
          "Could not save these permissions",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      showToast("Permissions updated", "success");
      queryClient.invalidateQueries({
        queryKey: [queryKey.attendants.getPermissions],
      });
      config?.onSuccess?.(data, variables, context);
    },
  });
};
