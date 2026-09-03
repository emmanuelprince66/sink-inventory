/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import {
  DefaultOptions,
  QueryClient,
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

/**
 * MutationConfig with the callbacks loosened to the three arguments callers
 * actually pass.
 *
 * React Query v5 gives onSuccess/onError a fourth parameter, so forwarding a
 * caller's callback as `(data, variables, context)` fails to typecheck against
 * the raw options type. Every api module here had grown its own interface
 * redeclaring the two callbacks to work around it; this is that same
 * declaration, written once.
 */
export type MutationCallbacks<MutationFnType extends (...args: any) => any> =
  Omit<MutationConfig<MutationFnType>, "onSuccess" | "onError"> & {
    onSuccess?: (data: any, variables: any, context: any) => void;
    onError?: (error: any, variables: any, context: any) => void;
  };

export { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
