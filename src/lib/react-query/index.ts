/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import {
  QueryClient,
  DefaultOptions,
  // UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    // useErrorBoundary: false,
    refetchOnWindowFocus: false,
    retry(failureCount, error: any) {
      if (error.status === 404) return false;
      else if (failureCount < 2) return true;
      else return false;
    },
    staleTime: 300000, // 5 minutes - Adjust for your application's needs.
    // cacheTime: 3600000, // 1 hour - Adjust for your application's needs.
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// This is used to extract the Return TYPE of a FUNCTION
export type ExtractFnReturnType<FnType extends (...args: any) => any> = Awaited<
  ReturnType<FnType>
>;

// This is used to get the queryConfigType of a specific QUERY function
export type QueryConfigType<QueryFnType extends (...args: any) => any> = any;
// export type QueryConfigType<QueryFnType extends (...args: any) => any> = Omit<
//   UseQueryOptions<ExtractFnReturnType<QueryFnType>>,
//   'queryKey' | 'queryFn'
// >;

// This is used to get the queryConfigType of a specific MUTATION function
export type MutationConfig<MutationFnType extends (...args: any) => any> =
  UseMutationOptions<
    ExtractFnReturnType<MutationFnType>,
    any,
    Parameters<MutationFnType>[0]
  >;

export { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
