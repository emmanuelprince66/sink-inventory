"use client";

import {
  ExtractFnReturnType,
  QueryConfigType,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/lib/react-query";

export type BookingServiceRecord = {
  id: string;
  name: string;
  category_id?: string | null;
  category?:
    | string
    | {
        id?: string;
        category_id?: string;
        name?: string;
        category?: string;
      }
    | null;
  category_name?: string | null;
  description?: string | null;
  amount: string | number;
  selling_price?: string | number;
  duration: number;
  deposit_amount?: string | number | null;
  max_capacity: number;
  assigned_staff_ids: string[];
  is_active: boolean;
};

export const getServiceCategoryName = (service: BookingServiceRecord) =>
  service.category_name ??
  (typeof service.category === "string"
    ? service.category
    : service.category?.name ?? service.category?.category ?? "");

export const getServiceCategoryId = (service: BookingServiceRecord) =>
  service.category_id ??
  (typeof service.category === "object"
    ? service.category?.id ?? service.category?.category_id
    : undefined);

export type ServiceCategoryRecord = {
  id: string;
  name: string;
  type?: string;
};

export const getServiceCategoryRecords = (
  response: unknown,
): ServiceCategoryRecord[] => {
  let value = response;
  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is ServiceCategoryRecord =>
          Boolean(
            item &&
              typeof item === "object" &&
              "id" in item &&
              typeof item.id === "string" &&
              "name" in item &&
              typeof item.name === "string",
          ),
      );
    }
    if (!value || typeof value !== "object") return [];
    const record = value as Record<string, unknown>;
    value = record.data ?? record.results;
  }
  return [];
};

export type MerchantBookingStatus =
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type MerchantPaymentStatus =
  | "UNPAID"
  | "PAID"
  | "DEPOSIT_PAID"
  | "REFUND_PENDING"
  | "REFUNDED";

export type MerchantBooking = {
  id: string;
  reference: string;
  booking_date: string;
  time?: string;
  start_time: string;
  end_time?: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  service_id?: string;
  service_name: string;
  duration?: string | number;
  staff_id?: string | null;
  staff_name: string;
  amount: string | number;
  amount_paid: string | number;
  refundable_amount?: string | number;
  balance_due: string | number;
  payment_option?: string;
  payment_status: MerchantPaymentStatus;
  booking_status: MerchantBookingStatus;
  notes?: string | null;
  cancellation_reason?: string | null;
  type?: "BOOKING";
  source?: string;
};

type MerchantBookingDetail = Partial<MerchantBooking> & {
  status?: MerchantBookingStatus;
  service_price?: string | number;
  duration_minutes?: number;
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  service?: { id?: string; name?: string; amount?: string | number; duration?: number };
  staff?: { id?: string; name?: string };
};

export type MerchantBookingsResponse = {
  summary: {
    today_bookings: number;
    upcoming: number;
    today_revenue: number;
    pending: number;
    pending_refunds: number;
    pending_refunds_amount: number;
  };
  selected_date: string;
  schedule: MerchantBooking[];
};

export type ServiceScheduleDay = {
  day_of_week: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
  breaks: { id?: string; name: string; start_time: string; end_time: string }[];
};

export type BookingPolicy = {
  booking_interval: number;
  min_notice_hours: number;
  max_advance_days: number;
  cancellation_window_hours: number;
  allow_full_payment: boolean;
  allow_deposit: boolean;
  allow_pay_at_business: boolean;
  default_deposit_amount: string | number;
};

export type ServiceBlockedTime = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  staff_id: string | null;
  staff_name?: string | null;
};

export type BookingApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

const request = async <T,>(
  path: string,
  options: RequestInit = {},
): Promise<BookingApiResponse<T>> => {
  const response = await fetch(`/api/service/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | BookingApiResponse<T>
    | null;
  if (!response.ok) {
    throw new Error(
      payload?.message ?? payload?.error ?? "Could not complete booking request",
    );
  }
  if (!payload) throw new Error("The booking API returned an empty response");
  return payload;
};

const bookingQueryKeys = {
  all: ["service-bookings"],
  list: (
    businessId: string,
    startDate: string,
    endDate: string,
    paymentStatus?: string,
  ) => [
    "service-bookings",
    businessId,
    startDate,
    endDate,
    paymentStatus ?? "schedule",
  ],
  detail: (bookingId: string) => ["service-booking", bookingId],
  services: (businessId: string) => ["service-catalogue", businessId],
  schedule: (businessId: string) => ["service-schedule", businessId],
  settings: (businessId: string) => ["service-booking-settings", businessId],
  blocked: (businessId: string, date: string) => [
    "service-blocked-times",
    businessId,
    date,
  ],
};

const fetchBookings = (
  businessId: string,
  startDate: string,
  endDate: string,
  paymentStatus?: string,
) => {
  const query = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });
  if (paymentStatus) query.set("payment_status", paymentStatus);
  return request<MerchantBookingsResponse>(
    `bookings/business/${businessId}?${query.toString()}`,
  );
};

export const useMerchantBookingsQuery = (
  businessId: string,
  startDate: string,
  endDate: string,
  paymentStatus?: string,
  config?: QueryConfigType<typeof fetchBookings>,
) =>
  useQuery<ExtractFnReturnType<typeof fetchBookings>>({
    queryKey: bookingQueryKeys.list(
      businessId,
      startDate,
      endDate,
      paymentStatus,
    ),
    queryFn: () => fetchBookings(businessId, startDate, endDate, paymentStatus),
    enabled: Boolean(businessId && startDate && endDate),
    ...config,
  });

const fetchBookingDetail = (bookingId: string) =>
  request<MerchantBookingDetail>(`bookings/${bookingId}`);

export const useMerchantBookingDetailQuery = (
  bookingId: string,
  config?: QueryConfigType<typeof fetchBookingDetail>,
) =>
  useQuery<ExtractFnReturnType<typeof fetchBookingDetail>>({
    queryKey: bookingQueryKeys.detail(bookingId),
    queryFn: () => fetchBookingDetail(bookingId),
    enabled: Boolean(bookingId),
    ...config,
  });

const fetchServices = (businessId: string) =>
  request<unknown>(`business/${businessId}/`);

export const useServiceCatalogueQuery = (
  businessId: string,
  config?: QueryConfigType<typeof fetchServices>,
) =>
  useQuery<ExtractFnReturnType<typeof fetchServices>>({
    queryKey: bookingQueryKeys.services(businessId),
    queryFn: () => fetchServices(businessId),
    enabled: Boolean(businessId),
    ...config,
  });

const fetchSchedule = (businessId: string) =>
  request<{ schedules: ServiceScheduleDay[] }>(`schedule/${businessId}`);

export const useServiceScheduleQuery = (
  businessId: string,
  config?: QueryConfigType<typeof fetchSchedule>,
) =>
  useQuery<ExtractFnReturnType<typeof fetchSchedule>>({
    queryKey: bookingQueryKeys.schedule(businessId),
    queryFn: () => fetchSchedule(businessId),
    enabled: Boolean(businessId),
    ...config,
  });

const fetchBookingSettings = (businessId: string) =>
  request<BookingPolicy>(`booking-settings/${businessId}`);

export const useBookingPolicyQuery = (
  businessId: string,
  config?: QueryConfigType<typeof fetchBookingSettings>,
) =>
  useQuery<ExtractFnReturnType<typeof fetchBookingSettings>>({
    queryKey: bookingQueryKeys.settings(businessId),
    queryFn: () => fetchBookingSettings(businessId),
    enabled: Boolean(businessId),
    ...config,
  });

const fetchBlockedTimes = (businessId: string, date: string) =>
  request<ServiceBlockedTime[]>(
    `blocked-times/${businessId}?date=${encodeURIComponent(date)}`,
  );

export const useServiceBlockedTimesQuery = (
  businessId: string,
  date: string,
  config?: QueryConfigType<typeof fetchBlockedTimes>,
) =>
  useQuery<ExtractFnReturnType<typeof fetchBlockedTimes>>({
    queryKey: bookingQueryKeys.blocked(businessId, date),
    queryFn: () => fetchBlockedTimes(businessId, date),
    enabled: Boolean(businessId && date),
    ...config,
  });

const useBookingMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["service-booking"] });
      await queryClient.invalidateQueries({ queryKey: ["service-catalogue"] });
      await queryClient.invalidateQueries({ queryKey: ["service-schedule"] });
      await queryClient.invalidateQueries({
        queryKey: ["service-booking-settings"],
      });
      await queryClient.invalidateQueries({ queryKey: ["service-blocked-times"] });
    },
  });
};

export const useCreateMerchantBookingMutation = () =>
  useBookingMutation(
    ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: Record<string, unknown>;
    }) =>
      request<MerchantBooking>(`bookings/business/${businessId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  );

export const useUpdateMerchantBookingMutation = () =>
  useBookingMutation(
    ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: Record<string, unknown>;
    }) =>
      request<MerchantBooking>(`bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  );

export const useCancelMerchantBookingMutation = () =>
  useBookingMutation(
    ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      request<MerchantBooking>(`bookings/${bookingId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  );

export const useCheckoutMerchantBookingMutation = () =>
  useBookingMutation(
    ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: {
        amount_received: string;
        method: "CASH" | "CARD" | "TRANSFER";
        bank_id: string | null;
      };
    }) =>
      request<MerchantBooking>(`bookings/${bookingId}/checkout`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  );

export const useDisburseBookingRefundMutation = () =>
  useBookingMutation(
    ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: {
        disbursement_method: "BANK_TRANSFER" | "CASH";
        reference?: string;
        notes?: string;
      };
    }) =>
      request<MerchantBooking>(`bookings/${bookingId}/disburse-refund`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  );

export const useSaveServiceScheduleMutation = () =>
  useBookingMutation(
    ({
      businessId,
      schedules,
    }: {
      businessId: string;
      schedules: ServiceScheduleDay[];
    }) =>
      request<{ schedules: ServiceScheduleDay[] }>(`schedule/${businessId}`, {
        method: "PUT",
        body: JSON.stringify({ schedules }),
      }),
  );

export const useSaveBookingPolicyMutation = () =>
  useBookingMutation(
    ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: Partial<BookingPolicy>;
    }) =>
      request<BookingPolicy>(`booking-settings/${businessId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  );

export const useCreateBlockedTimeMutation = () =>
  useBookingMutation(
    ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: Omit<ServiceBlockedTime, "id" | "staff_name">;
    }) =>
      request<ServiceBlockedTime>(`blocked-times/${businessId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  );

export const useDeleteBlockedTimeMutation = () =>
  useBookingMutation(
    ({ businessId, id }: { businessId: string; id: string }) =>
      request<null>(
        `blocked-times/${businessId}?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      ),
  );

export const useCreateServiceMutation = () =>
  useBookingMutation(
    ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: Partial<BookingServiceRecord>;
    }) =>
      request<BookingServiceRecord>(`business/${businessId}/`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  );

export const useUpdateServiceMutation = () =>
  useBookingMutation(
    ({
      serviceId,
      payload,
    }: {
      serviceId: string;
      payload: Partial<BookingServiceRecord>;
    }) =>
      request<BookingServiceRecord>(`single_service/${serviceId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  );

export const useDeleteServiceMutation = () =>
  useBookingMutation(({ serviceId }: { serviceId: string }) =>
    request<BookingServiceRecord>(`single_service/${serviceId}`, {
      method: "DELETE",
    }),
  );

export const unwrapBookingResponse = <T,>(response: BookingApiResponse<T>) =>
  response.data;

export const getServiceRecords = (
  response: BookingApiResponse<unknown> | undefined,
): BookingServiceRecord[] => {
  const data = response?.data;
  if (Array.isArray(data)) return data as BookingServiceRecord[];
  if (!data || typeof data !== "object") return [];

  const payload = data as {
    results?: unknown;
    data?: unknown;
  };
  if (Array.isArray(payload.results))
    return payload.results as BookingServiceRecord[];
  if (payload.results && typeof payload.results === "object") {
    const resultData = (payload.results as { data?: unknown }).data;
    if (Array.isArray(resultData)) return resultData as BookingServiceRecord[];
  }
  if (Array.isArray(payload.data)) return payload.data as BookingServiceRecord[];
  return [];
};

export const getBlockedTimeRecords = (
  response: BookingApiResponse<unknown> | undefined,
): ServiceBlockedTime[] => {
  const data = response?.data;
  if (Array.isArray(data)) return data as ServiceBlockedTime[];
  if (!data || typeof data !== "object") return [];
  const payload = data as { results?: unknown; data?: unknown };
  if (Array.isArray(payload.results))
    return payload.results as ServiceBlockedTime[];
  if (Array.isArray(payload.data)) return payload.data as ServiceBlockedTime[];
  return [];
};

export const getServiceScheduleDays = (
  response: BookingApiResponse<unknown> | undefined,
): ServiceScheduleDay[] => {
  const data = response?.data;
  if (Array.isArray(data)) return data as ServiceScheduleDay[];
  if (!data || typeof data !== "object") return [];
  const schedules = (data as { schedules?: unknown }).schedules;
  return Array.isArray(schedules) ? (schedules as ServiceScheduleDay[]) : [];
};

export const getBookingPolicy = (
  response: BookingApiResponse<unknown> | undefined,
): BookingPolicy | undefined => {
  const data = response?.data;
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as BookingPolicy)
    : undefined;
};

export const normalizeMerchantBooking = (
  response: BookingApiResponse<MerchantBookingDetail> | undefined,
): MerchantBooking | undefined => {
  const raw = response?.data;
  if (!raw?.id) return undefined;
  return {
    id: raw.id,
    reference: raw.reference ?? raw.id,
    booking_date: raw.booking_date ?? "",
    time: raw.time,
    start_time: raw.start_time ?? raw.time ?? "00:00",
    end_time: raw.end_time,
    customer_id: raw.customer_id ?? raw.customer?.id,
    customer_name: raw.customer_name ?? raw.customer?.name ?? "",
    customer_phone: raw.customer_phone ?? raw.customer?.phone ?? "",
    customer_email: raw.customer_email ?? raw.customer?.email,
    service_id: raw.service_id ?? raw.service?.id,
    service_name: raw.service_name ?? raw.service?.name ?? "",
    duration:
      raw.duration ?? raw.duration_minutes ?? raw.service?.duration ?? 0,
    staff_id: raw.staff_id ?? raw.staff?.id,
    staff_name: raw.staff_name ?? raw.staff?.name ?? "",
    amount: raw.amount ?? raw.service_price ?? raw.service?.amount ?? 0,
    amount_paid: raw.amount_paid ?? 0,
    refundable_amount: raw.refundable_amount,
    balance_due: raw.balance_due ?? 0,
    payment_option: raw.payment_option,
    payment_status: raw.payment_status ?? "UNPAID",
    booking_status: raw.booking_status ?? raw.status ?? "CONFIRMED",
    notes: raw.notes,
    cancellation_reason: raw.cancellation_reason,
    type: raw.type,
    source: raw.source,
  };
};
