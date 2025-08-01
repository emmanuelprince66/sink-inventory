import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRouter } from "next/navigation";

import { useCreateBusinessMutation } from "@/api/business/create-business";
import { useGetAllBusinessQuery } from "@/api/business/get-business";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useState } from "react";

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  type: z.string().min(1, "Business type is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  state: z.string().min(1, "State/Province is required"),
  city: z.string().min(1, "City/Town is required"),
  street: z.string().min(1, "Street is required"),
  logo: z
    .instanceof(File, { message: "Product image is required" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported"
    ),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

export const useBusinessHook = ({
  closeCreateBusinessModal,
}: {
  closeCreateBusinessModal?: () => void;
}) => {
  const { mutate: CreateBusiness } = useCreateBusinessMutation();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const setBusinessId = useBusinessStore((state) => state.setBusinessId);
  const setBusinessData = useBusinessDataStore(
    (state) => state.setBusinessData
  );

  const handleRowClick = (row: any) => {
    console.log("Clicked row:", row.original);
    console.log("Clicked row ID:", row.id);
    setBusinessData(row?.original);
    setBusinessId(row?.original?.id);

    router.push(`/pos`); // Navigate to the business details page

    // Perform any additional actions here
  };

  const businessTypeOptions = [
    { value: "Food & Restaurant", label: "Food & Restaurant" },
    { value: "Beauty & Personal Care", label: "Beauty & Personal Care" },
    { value: "Book & Stationery", label: "Book & Stationery" },
    { value: "Minimart & Retail", label: "Minimart & Retail" },
    { value: "Electronics & Gadget", label: "Electronics & Gadget" },
    { value: "Laundry", label: "Laundry" },
    { value: "Salon Business", label: "Salon Business" },
    {
      value: "Pharmacy & Health Products",
      label: "Pharmacy & Health Products",
    },
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

  const {
    data: AllBusinessData,
    isLoading: AllBusinessLoading,
    refetch: businessRefetch,
  } = useGetAllBusinessQuery();

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      logo: undefined,
      name: "",
      type: "",
      currency: "",
      country: "",
      state: "",
      city: "",
      street: "",
    },
  });
  const onSubmit = (values: BusinessFormValues) => {
    setLoading(true);

    console.log("values", values);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("currency", values.currency);
    formData.append("country", values.country);
    formData.append("state", values.state);
    formData.append("city", values.city);
    formData.append("street", values.street);
    formData.append("logo", values.logo);

    console.log("formData", formData);

    CreateBusiness(formData, {
      onSuccess: () => {
        setLoading(false);
        businessRefetch();
        if (closeCreateBusinessModal) closeCreateBusinessModal();
      },
      onError: (error) => {
        // Handle specific API errors
        if (error.statusCode === 401) {
          console.log("error--5", error);
          setLoading(false);
          // closeCreateBusinessModal();
        }
      },
    });
  };
  console.log("data---3", AllBusinessData);

  return {
    AllBusinessData,
    AllBusinessLoading,
    form,
    onSubmit,
    currencyOptions,
    loading,
    businessTypeOptions,
    handleRowClick,
  };
};
