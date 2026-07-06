// hooks/useBusinessHook.ts
"use client";

import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} from "@/api/business/create-business";
import { useDeleteBusinessMutation } from "@/api/business/delete-business";
import { useGetAllBusinessQuery } from "@/api/business/get-business";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  type: z.string().min(1, "Business type is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  state: z.string().min(1, "State/Province is required"),
  city: z.string().min(1, "City/Town is required"),
  street: z.string().min(1, "Street is required"),
  phone: z
    .string()
    .max(15, "Phone must not exceed 15 characters")
    .regex(/^[\d\s+\-()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  // Required array — an empty [] means "no days selected", so there's no
  // semantic reason to allow undefined. Keeping input and output as
  // string[] avoids the resolver/useForm type mismatch caused by mixing
  // .optional() with .default([]).
  delivery_days: z.array(z.string()),
  logo: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "File size must be less than 5MB",
        )
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "Only .jpg, .png, and .webp formats are supported",
        ),
      z.string(), // existing URL when editing
      z.null(),
    ])
    .optional()
    .nullable(),
});

// Delivery days enum (matches PATCH /business/{id}/ schema — 7 values).
export const DELIVERY_DAYS_OPTIONS = [
  { value: "MONDAY", short: "Mon" },
  { value: "TUESDAY", short: "Tue" },
  { value: "WEDNESDAY", short: "Wed" },
  { value: "THURSDAY", short: "Thu" },
  { value: "FRIDAY", short: "Fri" },
  { value: "SATURDAY", short: "Sat" },
  { value: "SUNDAY", short: "Sun" },
] as const;

export type BusinessFormValues = z.infer<typeof businessSchema>;

// ─── Options ──────────────────────────────────────────────────────────────────

const businessTypeOptions = [
  { value: "Food & Restaurant", label: "Food & Restaurant" },
  { value: "Beauty & Personal Care", label: "Beauty & Personal Care" },
  { value: "Book & Stationery", label: "Book & Stationery" },
  { value: "Minimart & Retail", label: "Minimart & Retail" },
  { value: "Electronics & Gadget", label: "Electronics & Gadget" },
  { value: "Laundry", label: "Laundry" },
  { value: "Salon Business", label: "Salon Business" },
  { value: "Pharmacy & Health Products", label: "Pharmacy & Health Products" },
  { value: "Home & Furniture", label: "Home & Furniture" },
  {
    value: "Construction Material & Suppliers",
    label: "Construction Material & Suppliers",
  },
  { value: "Logistics & Others", label: "Logistics & Others" },
];

const currencyOptions = [
  { value: "NGN", label: "Nigerian Naira" },
  { value: "USD", label: "US Dollar" },
  { value: "EUR", label: "Euro" },
  { value: "GBP", label: "British Pound" },
  { value: "JPY", label: "Japanese Yen" },
  { value: "CHF", label: "Swiss Franc" },
  { value: "CAD", label: "Canadian Dollar" },
  { value: "AUD", label: "Australian Dollar" },
  { value: "NZD", label: "New Zealand Dollar" },
  { value: "CNY", label: "Chinese Yuan" },
  { value: "INR", label: "Indian Rupee" },
  { value: "RUB", label: "Russian Ruble" },
  { value: "BRL", label: "Brazilian Real" },
  { value: "ZAR", label: "South African Rand" },
  { value: "MXN", label: "Mexican Peso" },
  { value: "SGD", label: "Singapore Dollar" },
  { value: "HKD", label: "Hong Kong Dollar" },
  { value: "SEK", label: "Swedish Krona" },
  { value: "KES", label: "Kenyan Shilling" },
  { value: "GHS", label: "Ghanaian Cedi" },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useBusinessHook = ({
  closeCreateBusinessModal,
}: {
  closeCreateBusinessModal?: () => void;
} = {}) => {
  const router = useRouter();
  const { user, role } = useUserRole();

  console.log("user--3", user);
  const setBusinessId = useBusinessStore((state) => state.setBusinessId);
  const setBusinessData = useBusinessDataStore(
    (state) => state.setBusinessData,
  );

  // ── Shared form ───────────────────────────────────────────────────────────
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      logo: null,
      name: "",
      type: "",
      currency: "",
      country: "",
      state: "",
      city: "",
      street: "",
      phone: "",
      email: "",
      delivery_days: [],
    },
  });

  // ── Fetch all businesses ──────────────────────────────────────────────────
  const {
    data: AllBusinessData,
    isLoading: AllBusinessLoading,
    refetch: businessRefetch,
  } = useGetAllBusinessQuery();

  // ── Row click — set business and navigate to POS ──────────────────────────
  const handleRowClick = (row: any) => {
    setBusinessData(row?.original);
    setBusinessId(row?.original?.id);
    z;

    const roleRouteMap: Record<string, string> = {
      ACCOUNTANT: "/sales",
      PHARMACIST: "/pos",
      "ADMIN-ATTENDANT": "/pos",
      ATTENDANT: "/pos",
      "PRODUCTION-MANAGER": "/sales",
      "INVENTORY-MANAGER": "/inventory",
    };

    const route = role ? roleRouteMap[role] || "/pos" : "/pos";
    router.push(route);
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const { mutate: CreateBusiness } = useCreateBusinessMutation();

  const onSubmit = (values: BusinessFormValues) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("currency", values.currency);
    formData.append("country", values.country);
    formData.append("state", values.state);
    formData.append("city", values.city);
    formData.append("street", values.street);
    if (values.phone) formData.append("phone", values.phone);
    if (values.email) formData.append("email", values.email);
    (values.delivery_days || []).forEach((day) => {
      formData.append("delivery_days", day);
    });
    if (values.logo instanceof File) {
      formData.append("logo", values.logo);
    }

    CreateBusiness(formData, {
      onSuccess: () => {
        setLoading(false);
        form.reset();
        businessRefetch();
        closeCreateBusinessModal?.();
      },
      onError: (error: any) => {
        if (error.statusCode === 401) {
          console.log("Unauthorized:", error);
        }
        setLoading(false);
      },
    });
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const [openEditBusinessModal, setOpenEditBusinessModal] = useState(false);
  const [editBusinessId, setEditBusinessId] = useState<string | null>(null);

  const closeEditBusinessModal = () => {
    setOpenEditBusinessModal(false);
    setEditBusinessId(null);
    form.reset();
  };

  const handleEditClick = (businessId: string) => {
    setEditBusinessId(businessId);
    setOpenEditBusinessModal(true);
  };

  const { data: EditBusinessData, isLoading: EditBusinessLoading } =
    useFetchBusinessById(editBusinessId ?? "", {
      enabled: !!editBusinessId,
    });

  // Pre-populate the shared form when edit data arrives
  useEffect(() => {
    if (EditBusinessData?.data && openEditBusinessModal) {
      const d = EditBusinessData.data;
      form.reset({
        logo: d.logo ?? null,
        name: d.name ?? "",
        type: d.type ?? "",
        currency: d.currency ?? "",
        country: d.country ?? "",
        state: d.state ?? "",
        city: d.city ?? "",
        street: d.street ?? "",
        // Prefer the direct field, fall back to owner.* for backwards compat.
        phone: d.phone ?? d.owner?.phone ?? "",
        email: d.email ?? d.owner?.email ?? "",
        delivery_days: Array.isArray(d.delivery_days) ? d.delivery_days : [],
      });
    }
  }, [EditBusinessData, openEditBusinessModal]);

  const { mutate: updateBusiness, isPending: isUpdating } =
    useUpdateBusinessMutation({
      onSuccess: () => {
        businessRefetch();
        closeEditBusinessModal();
      },
      onError: (error) => {
        console.error("Failed to update business:", error);
      },
    });

  // Build FormData matching updateBusiness(body: FormData) signature exactly
  const onEditSubmit = (values: BusinessFormValues) => {
    if (!editBusinessId) return;

    const formData = new FormData();
    formData.append("business_id", editBusinessId);
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("currency", values.currency);
    formData.append("country", values.country);
    formData.append("state", values.state);
    formData.append("city", values.city);
    formData.append("street", values.street);
    if (values.phone) formData.append("phone", values.phone);
    if (values.email) formData.append("email", values.email);
    (values.delivery_days || []).forEach((day) => {
      formData.append("delivery_days", day);
    });
    // Only append logo if user picked a new file; string URL = unchanged, skip it
    if (values.logo instanceof File) {
      formData.append("logo", values.logo);
    }

    updateBusiness(formData);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteBusinessId, setDeleteBusinessId] = useState<string | null>(null);

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setDeleteBusinessId(null);
  };

  const handleDeleteClick = (businessId: string) => {
    setDeleteBusinessId(businessId);
    setOpenDeleteModal(true);
  };

  const { mutate: deleteBusiness, isPending: isDeleting } =
    useDeleteBusinessMutation({
      onSuccess: () => {
        businessRefetch();
        closeDeleteModal();
      },
      onError: (error) => {
        console.error("Failed to delete business:", error);
      },
    });

  const handleConfirmDelete = () => {
    if (deleteBusinessId) {
      deleteBusiness(deleteBusinessId);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return {
    // form & options
    form,
    businessTypeOptions,
    currencyOptions,

    // create
    onSubmit,
    loading,

    // list
    AllBusinessData,
    AllBusinessLoading,
    handleRowClick,

    // user
    user,

    // edit
    openEditBusinessModal,
    closeEditBusinessModal,
    handleEditClick,
    EditBusinessData,
    EditBusinessLoading,
    onEditSubmit,
    isUpdating,

    // delete
    openDeleteModal,
    closeDeleteModal,
    handleDeleteClick,
    handleConfirmDelete,
    isDeleting,
  };
};
