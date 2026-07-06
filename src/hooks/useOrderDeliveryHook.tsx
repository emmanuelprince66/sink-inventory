import {
  useCreateOrderInhouseMutation,
  useCreateOrderShipbubbleMutation,
  useFetchShipmentRateMutation,
} from "@/api/orders/delivery";
import { queryKey } from "@/constants/query-key";
import { City, State } from "country-state-city";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "./toast/useToast";

export interface DeliveryAddress {
  phone: string;
  altPhone: string;
  email: string;
  shippingAddress: string;
  state: string; // ISO code, e.g. "LA"
  city: string;
}

export interface NormalizedCourier {
  id: string;
  location: string; // courier name
  amount: string;
  description: string;
  service_code?: string;
  courier_id?: string;
  image?: string;
  currency?: string;
  rating?: number;
  discountPercentage?: number;
  codAvailable?: boolean;
}

const EMPTY_ADDRESS: DeliveryAddress = {
  phone: "",
  altPhone: "",
  email: "",
  shippingAddress: "",
  state: "",
  city: "",
};

// Customer only has a single `name` field today (no first/last split) — derive
// both from it. A single-word name is duplicated into both so the backend's
// minLength:1 first_name/last_name requirement is still satisfied.
const splitCustomerName = (name: string) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

// Shipbubble rejects emojis, abbreviations and the symbols (_-+/'#).
const sanitizeAddressText = (v: string) =>
  (v || "")
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu,
      "",
    )
    .replace(/[_+/'#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeCourier = (c: any, idx: number): NormalizedCourier => ({
  id: String(c?.service_code ?? c?.courier_id ?? idx),
  location: c?.courier_name ?? "Courier",
  amount: String(c?.total ?? c?.rate_card_amount ?? 0),
  description: c?.delivery_eta ?? "",
  service_code: c?.service_code ?? c?.courier_id,
  courier_id: c?.courier_id,
  image: c?.courier_image,
  currency: c?.currency ?? "NGN",
  rating: typeof c?.ratings === "number" ? c.ratings : undefined,
  discountPercentage: c?.discount?.percentage ?? 0,
  codAvailable: !!c?.is_cod_available,
});

interface SubmitOrderArgs {
  products: { product_id: string; quantity: number }[];
  customerId: string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  paymentMethod?: string; // "CASH" | "BANK" (dashboard convention)
  bank?: string;
  amountPaid?: number;
  notes?: string;
  shippingDate?: string;
  shippingId?: string; // required for the in-house flow (static shipping method)
}

interface UseOrderDeliveryHookProps {
  businessId: string | null;
  findBusiness: any;
  /** Selected customer's name — first/last name are derived from this. */
  customerName?: string;
  /** Selected customer's phone/email — prefilled and locked when present. */
  customerPhone?: string;
  customerEmail?: string;
}

export const useOrderDeliveryHook = ({
  businessId,
  findBusiness,
  customerName,
  customerPhone,
  customerEmail,
}: UseOrderDeliveryHookProps) => {
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Only Shipbubble is wired up today — the app-wide convention for
  // "is Shipbubble connected and active" (see useShipbubbleHook).
  const isShipbubbleActive = Boolean(findBusiness?.shipbubble?.is_active);

  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const updateAddressField = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "state") next.city = "";
      return next;
    });
  };

  // Phone/email come from the customer's profile when available — keep them
  // in sync with whichever customer is selected instead of asking the
  // merchant to retype data we already have.
  const isPhoneLocked = Boolean(customerPhone?.trim());
  const isEmailLocked = Boolean(customerEmail?.trim());

  useEffect(() => {
    setAddress((prev) => ({
      ...prev,
      phone: customerPhone?.trim() || "",
      email: customerEmail?.trim() || "",
    }));
  }, [customerPhone, customerEmail]);

  // Deliveries are domestic (Nigeria) — matches the Shipbubble pickup-address
  // setup, which is already locked to NG elsewhere in this app.
  const stateList = useMemo(() => State.getStatesOfCountry("NG"), []);
  const cityList = useMemo(
    () => (address.state ? City.getCitiesOfState("NG", address.state) : []),
    [address.state],
  );

  const isAddressComplete = Boolean(
    customerName?.trim() &&
      address.phone.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email) &&
      address.shippingAddress.trim() &&
      address.state,
  );

  const buildAddressPayload = () => {
    const stateName =
      stateList.find((s) => s.isoCode === address.state)?.name ||
      address.state;
    const { firstName, lastName } = splitCustomerName(customerName || "");

    return {
      first_name: sanitizeAddressText(firstName),
      last_name: sanitizeAddressText(lastName),
      phone: address.phone,
      alt_phone: address.altPhone || null,
      email: address.email,
      country: "Nigeria",
      state: stateName,
      city: address.city ? sanitizeAddressText(address.city) : null,
      shipping_address: sanitizeAddressText(address.shippingAddress),
    };
  };

  // ─── Shipment rates (Shipbubble only) ───────────────────────────────────
  const [shipmentRates, setShipmentRates] = useState<NormalizedCourier[]>([]);
  const [selectedCourier, setSelectedCourier] =
    useState<NormalizedCourier | null>(null);
  const [requestToken, setRequestToken] = useState("");
  const [shipmentReference, setShipmentReference] = useState("");
  const [ratesError, setRatesError] = useState<string | null>(null);

  const { mutate: fetchRateMutate, isPending: isFetchingRates } =
    useFetchShipmentRateMutation();

  const fetchRates = (
    products: { product_id: string; quantity: number }[],
    note?: string,
  ) => {
    if (!businessId) return;
    if (!isAddressComplete) {
      showToast("Please complete the delivery address first", "error");
      return;
    }

    setRatesError(null);
    setShipmentRates([]);
    setSelectedCourier(null);

    fetchRateMutate(
      {
        businessId,
        payload: { products, address: buildAddressPayload(), note },
      },
      {
        onSuccess: (data: any) => {
          const root = data?.data?.data ?? data?.data ?? {};
          const couriers: any[] =
            root.couriers ?? root.rates ?? root.results ?? root.data ?? [];

          setRequestToken(root.request_token ?? "");
          setShipmentReference(root.reference ?? "");

          const normalized = (Array.isArray(couriers) ? couriers : []).map(
            normalizeCourier,
          );
          setShipmentRates(normalized);

          if (normalized.length === 0) {
            setRatesError("No delivery options available for this address");
          }
        },
        onError: (error: any) => {
          setRatesError(
            error?.message || "Could not fetch delivery rates",
          );
        },
      },
    );
  };

  const resetShipmentRates = () => {
    setShipmentRates([]);
    setSelectedCourier(null);
    setRequestToken("");
    setShipmentReference("");
    setRatesError(null);
  };

  // ─── Submission ──────────────────────────────────────────────────────────
  const { mutate: createInhouseMutate, isPending: isCreatingInhouse } =
    useCreateOrderInhouseMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKey.orders.getAllOrders],
        });
        router.push("/orders");
      },
    });

  const { mutate: createShipbubbleMutate, isPending: isCreatingShipbubble } =
    useCreateOrderShipbubbleMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKey.orders.getAllOrders],
        });
        router.push("/orders");
      },
    });

  const mapPaymentMethod = (method?: string): "BANK-TRANSFER" | "CASH" =>
    method === "BANK" ? "BANK-TRANSFER" : "CASH";

  const submitOrder = ({
    products,
    customerId,
    paymentStatus,
    paymentMethod,
    bank,
    amountPaid,
    notes,
    shippingDate,
    shippingId,
  }: SubmitOrderArgs) => {
    if (!businessId) {
      showToast("Business ID is missing", "error");
      return;
    }

    if (!isAddressComplete) {
      showToast("Please complete the delivery address", "error");
      return;
    }

    const includePayment = paymentStatus !== "UNPAID";

    if (isShipbubbleActive) {
      if (!selectedCourier || !shipmentReference || !requestToken) {
        showToast("Please select a delivery option", "error");
        return;
      }

      createShipbubbleMutate({
        reference: shipmentReference,
        payload: {
          customer: customerId,
          payment_status: paymentStatus,
          ...(includePayment && {
            payment_method: mapPaymentMethod(paymentMethod),
          }),
          ...(bank && { bank }),
          ...(amountPaid && { amount_paid: amountPaid.toFixed(2) }),
          request_token: requestToken,
          service_code: selectedCourier.service_code || "",
          courier_id: selectedCourier.courier_id || "",
          channel: "OUTSTORE",
        },
      });
    } else {
      if (!shippingId) {
        showToast("Please select a shipping method", "error");
        return;
      }

      createInhouseMutate({
        businessId,
        payload: {
          products,
          address: buildAddressPayload(),
          shipping_date: shippingDate,
          note: notes || undefined,
          customer: customerId,
          payment_status: paymentStatus,
          ...(includePayment && {
            payment_method: mapPaymentMethod(paymentMethod),
          }),
          ...(bank && { bank }),
          ...(amountPaid && { amount_paid: amountPaid.toFixed(2) }),
          shipping_id: shippingId,
        },
      });
    }
  };

  return {
    // Address
    address,
    updateAddressField,
    stateList,
    cityList,
    isAddressComplete,
    isPhoneLocked,
    isEmailLocked,

    // Shipbubble
    isShipbubbleActive,
    shipmentRates,
    isFetchingRates,
    ratesError,
    fetchRates,
    resetShipmentRates,
    selectedCourier,
    setSelectedCourier,

    // Submission
    submitOrder,
    isSubmittingOrder: isCreatingInhouse || isCreatingShipbubble,
  };
};
