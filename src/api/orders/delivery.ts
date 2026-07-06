import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import {
  ExtractFnReturnType,
  MutationConfig,
  useMutation,
} from "@/lib/react-query";

// ─── Shared address shape (POST body for both fetch-rate and in-house create) ──

export interface DeliveryAddressPayload {
  first_name: string;
  last_name: string;
  phone: string;
  alt_phone?: string | null;
  email: string;
  country: string;
  state: string;
  city?: string | null;
  shipping_address?: string;
}

// ─── POST /order/fetch_shipment_rate/{business_id}/ ────────────────────────

interface ShipmentRatePayload {
  products: { product_id: string; quantity: number }[];
  address: DeliveryAddressPayload;
  note?: string;
}

const fetchShipmentRate = async ({
  businessId,
  payload,
}: {
  businessId: string;
  payload: ShipmentRatePayload;
}) => {
  const response = await fetch(
    `/api/orders/${businessId}/fetch-shipment-rate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

type FetchShipmentRateFnType = typeof fetchShipmentRate;

export const useFetchShipmentRateMutation = (
  config?: MutationConfig<FetchShipmentRateFnType>,
) => {
  const { showToast } = useToast();

  return useMutation<
    ExtractFnReturnType<FetchShipmentRateFnType>,
    any,
    Parameters<FetchShipmentRateFnType>[0]
  >({
    mutationKey: [queryKey.orders.fetchShipmentRate],
    mutationFn: fetchShipmentRate,
    retry: false,
    onError: (error: any, variables, onMutateResult, context) => {
      const errorMessage =
        error?.message || error?.error || "Could not fetch delivery rates";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, onMutateResult, context);
    },
    ...config,
  });
};

// ─── POST /order/business/create_order_inhouse/{business_id}/ ─────────────

interface CreateOrderInhousePayload {
  products: { product_id: string; quantity: number }[];
  address: DeliveryAddressPayload;
  shipping_date?: string;
  note?: string;
  customer: string;
  payment_status: "UNPAID" | "PARTIAL" | "PAID";
  bank?: string;
  amount_paid?: string;
  payment_method?: "BANK-TRANSFER" | "CASH";
  shipping_id: string;
}

const createOrderInhouse = async ({
  businessId,
  payload,
}: {
  businessId: string;
  payload: CreateOrderInhousePayload;
}) => {
  const response = await fetch(`/api/orders/${businessId}/create-inhouse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

type CreateOrderInhouseFnType = typeof createOrderInhouse;

export const useCreateOrderInhouseMutation = (
  config?: MutationConfig<CreateOrderInhouseFnType>,
) => {
  const { showToast } = useToast();

  return useMutation<
    ExtractFnReturnType<CreateOrderInhouseFnType>,
    any,
    Parameters<CreateOrderInhouseFnType>[0]
  >({
    mutationKey: [queryKey.orders.createOrderInhouse],
    mutationFn: createOrderInhouse,
    retry: false,
    onError: (error: any, variables, onMutateResult, context) => {
      const errorMessage =
        error?.message || error?.error || "Error creating order";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, onMutateResult, context);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      showToast("Order created successfully", "success");
      config?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...config,
  });
};

// ─── POST /order/business/create_order_shipbubble/{reference}/ ────────────

interface CreateOrderShipbubblePayload {
  customer: string;
  payment_status: "UNPAID" | "PARTIAL" | "PAID";
  bank?: string;
  amount_paid?: string;
  payment_method?: "BANK-TRANSFER" | "CASH";
  request_token: string;
  service_code: string;
  courier_id: string;
  channel?: "STORE" | "OUTSTORE" | "INSTORE";
}

const createOrderShipbubble = async ({
  reference,
  payload,
}: {
  reference: string;
  payload: CreateOrderShipbubblePayload;
}) => {
  const response = await fetch(`/api/orders/${reference}/create-shipbubble`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

type CreateOrderShipbubbleFnType = typeof createOrderShipbubble;

export const useCreateOrderShipbubbleMutation = (
  config?: MutationConfig<CreateOrderShipbubbleFnType>,
) => {
  const { showToast } = useToast();

  return useMutation<
    ExtractFnReturnType<CreateOrderShipbubbleFnType>,
    any,
    Parameters<CreateOrderShipbubbleFnType>[0]
  >({
    mutationKey: [queryKey.orders.createOrderShipbubble],
    mutationFn: createOrderShipbubble,
    retry: false,
    onError: (error: any, variables, onMutateResult, context) => {
      const errorMessage =
        error?.message || error?.error || "Error creating order";
      showToast(errorMessage, "error");
      config?.onError?.(error, variables, onMutateResult, context);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      showToast("Order created successfully", "success");
      config?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...config,
  });
};
