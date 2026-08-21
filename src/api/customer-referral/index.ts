import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationConfig,
  QueryConfigType,
  useMutation,
  useQuery,
} from "@/lib/react-query";
import { ApiResponse, Paginated } from "@/types/api";
import type {
  AddReferralParticipant,
  CustomerReferralOverview,
  CustomerReferralParticipant,
  CustomerReferralProgramme,
  CustomerReferralProgrammeCreate,
  CustomerReferralProgrammeUpdate,
} from "@/types/customerReferral";

const BASE = "/api/referral/customer-programmes";

/** Every handler returns { success, data, message }; only data matters here. */
const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  return response.json() as Promise<T>;
};

const withBusiness = (path: string, business_id: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(path, window.location.origin);
  url.searchParams.set("business_id", business_id);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
};

// ─── Programmes ──────────────────────────────────────────────────────────────

export type FetchReferralProgrammesParams = {
  business_id: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchReferralProgrammes = ({
  business_id,
  ...params
}: FetchReferralProgrammesParams) =>
  request<ApiResponse<Paginated<CustomerReferralProgramme>>>(
    withBusiness(BASE, business_id, params),
  );

export const useFetchReferralProgrammesQuery = ({
  params,
  ...config
}: QueryConfigType<typeof fetchReferralProgrammes> & {
  params: FetchReferralProgrammesParams;
}) =>
  useQuery<ExtractFnReturnType<typeof fetchReferralProgrammes>>({
    queryKey: [
      queryKey.customerReferral.getProgrammes,
      params.business_id,
      params.search,
      params.page,
    ],
    queryFn: () => fetchReferralProgrammes(params),
    enabled: Boolean(params.business_id),
    ...config,
  });

// ─── Overview ────────────────────────────────────────────────────────────────

export const fetchReferralOverview = ({ business_id }: { business_id: string }) =>
  request<ApiResponse<CustomerReferralOverview>>(
    withBusiness(`${BASE}/overview`, business_id),
  );

export const useFetchReferralOverviewQuery = ({
  params,
  ...config
}: QueryConfigType<typeof fetchReferralOverview> & {
  params: { business_id: string };
}) =>
  useQuery<ExtractFnReturnType<typeof fetchReferralOverview>>({
    queryKey: [queryKey.customerReferral.getOverview, params.business_id],
    queryFn: () => fetchReferralOverview(params),
    enabled: Boolean(params.business_id),
    ...config,
  });

// ─── Single programme ────────────────────────────────────────────────────────
// Needed because the manage screen has its own URL: arriving there directly, or
// refreshing it, means there is no list in cache to read the programme from.

export const fetchReferralProgramme = ({
  programmeId,
}: {
  programmeId: string;
}) => request<ApiResponse<CustomerReferralProgramme>>(`${BASE}/${programmeId}`);

export const useFetchReferralProgrammeQuery = ({
  params,
  ...config
}: QueryConfigType<typeof fetchReferralProgramme> & {
  params: { programmeId: string };
}) =>
  useQuery<ExtractFnReturnType<typeof fetchReferralProgramme>>({
    queryKey: [queryKey.customerReferral.getProgramme, params.programmeId],
    queryFn: () => fetchReferralProgramme(params),
    enabled: Boolean(params.programmeId),
    ...config,
  });

// ─── Create ──────────────────────────────────────────────────────────────────

export const createReferralProgramme = ({
  business_id,
  payload,
}: {
  business_id: string;
  payload: CustomerReferralProgrammeCreate;
}) =>
  request<ApiResponse<CustomerReferralProgramme>>(
    withBusiness(BASE, business_id),
    { method: "POST", body: JSON.stringify(payload) },
  );

type CreateFn = (
  payload: CustomerReferralProgrammeCreate,
) => ReturnType<typeof createReferralProgramme>;

export const useCreateReferralProgrammeMutation = ({
  business_id,
  ...config
}: MutationConfig<CreateFn> & {
  business_id: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.customerReferral.createProgramme, business_id],
    mutationFn: (payload: CustomerReferralProgrammeCreate) =>
      createReferralProgramme({ business_id, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Could not create the programme",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Referral programme created", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};

// ─── Update (rename, re-rate, pause) ─────────────────────────────────────────

export const updateReferralProgramme = ({
  programmeId,
  payload,
}: {
  programmeId: string;
  payload: CustomerReferralProgrammeUpdate;
}) =>
  request<ApiResponse<CustomerReferralProgramme>>(`${BASE}/${programmeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

type UpdateFn = (
  payload: CustomerReferralProgrammeUpdate,
) => ReturnType<typeof updateReferralProgramme>;

export const useUpdateReferralProgrammeMutation = ({
  programmeId,
  ...config
}: MutationConfig<UpdateFn> & {
  programmeId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.customerReferral.updateProgramme, programmeId],
    mutationFn: (payload: CustomerReferralProgrammeUpdate) =>
      updateReferralProgramme({ programmeId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Could not update the programme",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Programme updated", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};

// ─── Participants ────────────────────────────────────────────────────────────

export type FetchParticipantsParams = {
  programmeId: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const fetchReferralParticipants = ({
  programmeId,
  ...params
}: FetchParticipantsParams) => {
  const url = new URL(
    `${BASE}/${programmeId}/participants`,
    window.location.origin,
  );
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  }
  return request<ApiResponse<Paginated<CustomerReferralParticipant>>>(
    url.toString(),
  );
};

export const useFetchReferralParticipantsQuery = ({
  params,
  ...config
}: QueryConfigType<typeof fetchReferralParticipants> & {
  params: FetchParticipantsParams;
}) =>
  useQuery<ExtractFnReturnType<typeof fetchReferralParticipants>>({
    queryKey: [
      queryKey.customerReferral.getParticipants,
      params.programmeId,
      params.search,
      params.page,
    ],
    queryFn: () => fetchReferralParticipants(params),
    enabled: Boolean(params.programmeId),
    ...config,
  });

export const addReferralParticipant = ({
  programmeId,
  payload,
}: {
  programmeId: string;
  payload: AddReferralParticipant;
}) =>
  request<ApiResponse<CustomerReferralParticipant>>(
    `${BASE}/${programmeId}/participants`,
    { method: "POST", body: JSON.stringify(payload) },
  );

type AddParticipantFn = (
  payload: AddReferralParticipant,
) => ReturnType<typeof addReferralParticipant>;

export const useAddReferralParticipantMutation = ({
  programmeId,
  ...config
}: MutationConfig<AddParticipantFn> & {
  programmeId: string;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
}) => {
  const { showToast } = useToast();

  return useMutation({
    mutationKey: [queryKey.customerReferral.addParticipant, programmeId],
    mutationFn: (payload: AddReferralParticipant) =>
      addReferralParticipant({ programmeId, payload }),
    retry: false,
    onError: (error: any, variables: any, context: any) => {
      showToast(
        error?.message || error?.error || "Could not add the participant",
        "error",
      );
      config?.onError?.(error, variables, context);
    },
    onSuccess: (data: any, variables: any, context: any) => {
      showToast("Participant added", "success");
      config?.onSuccess?.(data, variables, context);
    },
    ...config,
  });
};
