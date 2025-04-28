import { useState, useEffect, useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRouter } from "next/navigation";

import { useCreateCustomerMutation } from "@/api/customer/create-customer";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

import { useDebounce } from "./useDebounce";

const CustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(1, "Email address is required"),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;

// Create this custom hook in your hooks folder

export const useCustomerHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const router = useRouter();

  const { mutate: createCustomer, isPending: createCustomerLoading } =
    useCreateCustomerMutation({
      businessId: business_id, // Convert null to undefined
    });

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 500); // 500ms debounce
  const filterOptions = [
    "All",
    "Most Active",
    "Least Active",
    "Debts",
  ] as const;

  const filterMapping = {
    All: "",
    "Most Active": "MOST_ACTIVE",
    "Least Active": "LEAST_ACTIVE",
    Debts: "DEBTS",
  } as const;
  const [activeFilter, setActiveFilter] = useState<
    (typeof filterOptions)[number]
  >(filterOptions[0]);

  // console.log("activeFilter", activeFilter);
  // Only search when term has at least 3 characters or is empty (to reset)
  const searchTerm =
    debouncedSearchTerm.length >= 3 || debouncedSearchTerm.length === 0
      ? debouncedSearchTerm
      : null;

  const {
    data: CustomerData,
    isLoading: CustomerLoading,
    error: CustomerError,
  } = useGetCustomerQuery({
    params: {
      id: business_id,
      search: searchTerm,
      status: filterMapping[activeFilter],
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Refetch data when filter changes

  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);

  const closeOpenCustomerModal = () => setOpenAddCustomerModal(false);
  const openCustomerModalFunc = () => setOpenAddCustomerModal(true);

  const handleRowClick = (row: any) => {
    router.push(`/customers/${row.original.id}`);
    // console.log("Clicked row:", row.original);
    // console.log("Clicked row ID:", row.id);

    // Perform any additional actions here
  };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: CustomerFormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone,
      email: values.email,
    };
    // console.log("payload", payload);

    createCustomer({
      payload,
      businessId: business_id,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleFilterChange = (filter: (typeof filterOptions)[number]) => {
    setActiveFilter(filter);
  };

  // console.log("CustomerData", CustomerData);

  return {
    openAddCustomerModal,
    form,
    closeOpenCustomerModal,
    onSubmit,

    CustomerSchema,

    openCustomerModalFunc,
    handleRowClick,
    CustomerData,
    createCustomerLoading,
    CustomerLoading,
    CustomerError,
    searchInput,
    handleSearchChange,
    filterOptions,
    activeFilter,
    handleFilterChange,
  };
};
