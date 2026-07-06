"use client";

import { useUpdateBusinessShipbubbleMutation } from "@/api/business/create-business";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import {
  BoxSizeOption,
  ShippingCategoryOption,
  useFetchBoxSizesQuery,
  useFetchShippingCategoriesQuery,
} from "@/api/shipping/shipbubble";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// ─── Public shape used by the Shipbubble setup modal ────────────────────────

export type ShippingCompany = "SHIPBUBBLE" | "CHOWDECK";

export interface ShipbubbleSettings {
  street: string;
  city: string;
  state: string;
  phone: string;
  landmark: string;
  category: ShippingCategoryOption | null;
  packageSize: BoxSizeOption | null;
  /** Backend's `shipbubble_settings.is_active`. Drives the AutomatedShipping toggle. */
  isActive: boolean;
}

const EMPTY_SETTINGS: ShipbubbleSettings = {
  street: "",
  city: "",
  state: "",
  phone: "",
  landmark: "",
  category: null,
  packageSize: null,
  isActive: false,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

// Hydrate the modal's local state from whatever the business endpoint returned.
const hydrateFromBusiness = (
  business: any | undefined,
): {
  settings: ShipbubbleSettings;
  companies: ShippingCompany[];
} => {
  const sb = business?.shipbubble || business?.shipbubble_settings || null;
  const rawCompanies: string[] = Array.isArray(business?.shipping_companies)
    ? business.shipping_companies
    : [];
  const companies = rawCompanies.filter(
    (c): c is ShippingCompany => c === "SHIPBUBBLE" || c === "CHOWDECK",
  );

  if (!sb) {
    return { settings: { ...EMPTY_SETTINGS }, companies };
  }

  const category: ShippingCategoryOption | null = sb.category
    ? {
        category_id: Number(sb.category.category_id),
        category: String(sb.category.category),
      }
    : null;

  const packageSize: BoxSizeOption | null = sb.package_size
    ? {
        name: String(sb.package_size.name),
        description_image_url: String(
          sb.package_size.description_image_url || "",
        ),
        height: sb.package_size.height,
        width: sb.package_size.width,
        length: sb.package_size.length,
        max_weight: sb.package_size.max_weight,
      }
    : null;

  return {
    settings: {
      street: sb.street || "",
      city: sb.city || "",
      state: sb.state || "",
      phone: sb.phone || "",
      landmark: sb.landmark || "",
      category,
      packageSize,
      isActive: Boolean(sb.is_active),
    },
    companies,
  };
};

// Build the JSON body for /api/businesses/update-shipbubble.
// DRF's nested-writable serializer needs a real nested object, not a JSON
// string inside FormData — that's why this path is JSON, not multipart.
// Write field is `shipbubble_settings`; the response echoes it back as `shipbubble`.
const buildPatchPayload = (
  businessId: string,
  settings: ShipbubbleSettings,
  companies: ShippingCompany[],
) => {
  const body: {
    business_id: string;
    shipbubble_settings?: Record<string, unknown>;
    shipping_companies: string[];
  } = {
    business_id: businessId,
    shipping_companies: companies,
  };

  if (settings.category && settings.packageSize) {
    body.shipbubble_settings = {
      street: settings.street.trim(),
      city: settings.city.trim(),
      state: settings.state.trim(),
      phone: settings.phone.trim(),
      landmark: settings.landmark.trim(),
      category: {
        category_id: settings.category.category_id,
        category: settings.category.category,
      },
      package_size: {
        name: settings.packageSize.name,
        description_image_url: settings.packageSize.description_image_url,
        height: settings.packageSize.height,
        width: settings.packageSize.width,
        length: settings.packageSize.length,
        max_weight: settings.packageSize.max_weight,
      },
      is_active: settings.isActive,
    };
  }

  return body;
};

// ─── The hook ───────────────────────────────────────────────────────────────

interface UseShipbubbleHookOptions {
  /** Auto-hydrate when the business object loads. Defaults to true. */
  autoHydrate?: boolean;
}

export const useShipbubbleHook = (opts: UseShipbubbleHookOptions = {}) => {
  const { autoHydrate = true } = opts;
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const business_id = useBusinessStore((s) => s.business_id);

  // Live business data — drives the initial form values.
  const businessQuery = useFetchBusinessById(business_id || "");
  const business = businessQuery.data?.data;

  // Box-size + category reference lists (cached for an hour).
  const boxSizesQuery = useFetchBoxSizesQuery();
  const categoriesQuery = useFetchShippingCategoriesQuery();

  // Local form state.
  const [settings, setSettings] = useState<ShipbubbleSettings>(EMPTY_SETTINGS);
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [didHydrate, setDidHydrate] = useState(false);

  // Hydrate once the business arrives.
  useEffect(() => {
    if (!autoHydrate) return;
    if (!business || didHydrate) return;
    const next = hydrateFromBusiness(business);
    setSettings(next.settings);
    setCompanies(next.companies);
    setDidHydrate(true);
  }, [autoHydrate, business, didHydrate]);

  // ─── Setters ─────────────────────────────────────────────────────────────
  const updateSetting = <K extends keyof ShipbubbleSettings>(
    key: K,
    value: ShipbubbleSettings[K],
  ) => setSettings((prev) => ({ ...prev, [key]: value }));

  const toggleCompany = (company: ShippingCompany) =>
    setCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company],
    );

  const resetFromBusiness = () => {
    if (!business) return;
    const next = hydrateFromBusiness(business);
    setSettings(next.settings);
    setCompanies(next.companies);
  };

  // ─── Mutation ────────────────────────────────────────────────────────────
  const { mutate: updateBusiness, isPending: isSaving } =
    useUpdateBusinessShipbubbleMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKey.business.getBusinessById, business_id],
        });
      },
    });

  // Address-only validation — used by the Dispatch Pickup form, since it
  // doesn't know or care about category / package size.
  const validateAddress = (
    candidate: ShipbubbleSettings = settings,
  ): string | null => {
    const required: Array<{ key: keyof ShipbubbleSettings; label: string }> = [
      { key: "street", label: "street" },
      { key: "city", label: "city" },
      { key: "state", label: "state" },
      { key: "phone", label: "phone" },
    ];
    for (const { key, label } of required) {
      if (!String(candidate[key] || "").trim()) return `Please fill in ${label}.`;
    }
    return null;
  };

  // Full validation — used by the Shipbubble Configure modal before save.
  const validateSettings = (
    candidate: ShipbubbleSettings = settings,
  ): string | null => {
    const addressError = validateAddress(candidate);
    if (addressError) return addressError;
    if (!candidate.category) return "Pick a shipping category.";
    if (!candidate.packageSize) return "Pick a default package size.";
    return null;
  };

  const save = (
    overrides?: {
      /** Override companies just for this save (e.g. when toggling off). */
      shippingCompanies?: ShippingCompany[];
      /** Override settings (rare — used by quick actions). */
      settingsPatch?: Partial<ShipbubbleSettings>;
    },
    callbacks?: { onSuccess?: () => void; onError?: () => void },
  ) => {
    if (!business_id) {
      showToast("Business is not loaded yet.", "error");
      return;
    }
    const effectiveSettings = overrides?.settingsPatch
      ? { ...settings, ...overrides.settingsPatch }
      : settings;
    const effectiveCompanies = overrides?.shippingCompanies ?? companies;

    const payload = buildPatchPayload(
      business_id,
      effectiveSettings,
      effectiveCompanies,
    );
    updateBusiness(payload, {
      onSuccess: () => callbacks?.onSuccess?.(),
      onError: () => callbacks?.onError?.(),
    });
  };

  // ─── Quick toggle for shipbubble_settings.is_active ──────────────────────
  // The backend only accepts a full shipbubble_settings object on PATCH (all
  // nested fields are required), so flipping is_active means re-sending the
  // current saved values + the new flag. Caller is expected to have already
  // configured Shipbubble (isConfigured === true) before flipping ON.
  const setActive = (
    next: boolean,
    callbacks?: { onSuccess?: () => void; onError?: () => void },
  ) => {
    // Local update first so the switch animates immediately.
    setSettings((prev) => ({ ...prev, isActive: next }));
    save({ settingsPatch: { isActive: next } }, callbacks);
  };

  // ─── Derived flags ───────────────────────────────────────────────────────
  const isShipbubbleEnabled = companies.includes("SHIPBUBBLE");
  const isChowdeckEnabled = companies.includes("CHOWDECK");
  // Pickup address is set (Dispatch Pickup step done).
  const hasPickup = Boolean(business?.shipbubble?.street);
  // Full Shipbubble setup is done — pickup + category + box size.
  const isConfigured = Boolean(
    business?.shipbubble?.street && business?.shipbubble?.category,
  );
  // Backend flag — drives the AutomatedShipping toggle. Source of truth is
  // the server response; local `settings.isActive` is just the optimistic copy.
  const isShipbubbleActive = Boolean(business?.shipbubble?.is_active);

  return {
    // Reference data
    boxSizes: boxSizesQuery.data?.data || [],
    boxSizesLoading: boxSizesQuery.isLoading,
    categories: categoriesQuery.data?.data || [],
    categoriesLoading: categoriesQuery.isLoading,

    // Business / business id
    business,
    businessLoading: businessQuery.isLoading,
    business_id,

    // Local form state
    settings,
    companies,
    updateSetting,
    setSettings,
    toggleCompany,
    resetFromBusiness,

    // Mutation
    save,
    setActive,
    validateAddress,
    validateSettings,
    isSaving,

    // Derived
    isShipbubbleEnabled,
    isShipbubbleActive,
    isChowdeckEnabled,
    hasPickup,
    isConfigured,
  };
};
