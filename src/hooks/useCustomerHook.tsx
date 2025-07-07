import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";

import { useRouter } from "next/navigation";

import { useCreateCustomerMutation } from "@/api/customer/create-customer";
import { useDeleteCustomerMutation } from "@/api/customer/delete-customer";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

import { queryKey } from "@/constants/query-key";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useDebounce } from "./useDebounce";

const CustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;

// Create this custom hook in your hooks folder

export const useCustomerHook = ({
  closeModal,
  handleOpenNotSubscribeModal,
  dateRange,
}: {
  closeModal?: () => void;
  handleOpenNotSubscribeModal?: () => void;
  dateRange?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const isUserSubscribed = useIsUserSubscribeStore(
    (state) => state.is_subscribed
  );
  const queryClient = useQueryClient();
  const { user } = useUserRole();

  console.log("isUserSubscribed", isUserSubscribed);
  const router = useRouter();
  const { showToast } = useToast();

  const {
    mutate: createCustomer,
    isPending: createCustomerLoading,
    isSuccess: createCustomerSuccess,
  } = useCreateCustomerMutation({
    businessId: business_id, // Convert null to undefined
    onSuccess: (data) => {
      console.log("data", data);
      showToast(data.message, "success");
      queryClient.invalidateQueries({
        queryKey: [queryKey.customers.getAllCustomers],
      });
      refetch();
      if (closeModal) closeModal();
      // Optional: Invalidate queries or update cache
    },

    // You can add other callbacks here if needed
  });

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 500); // 500ms debounce
  const filterOptions = [
    "All",
    "Most Active",
    "New",
    "Least Active",
    "Debts",
  ] as const;

  const filterMapping = {
    All: "",
    "Most Active": "MOST_ACTIVE",
    "Least Active": "LEAST_ACTIVE",
    New: "NEW",
    Debts: "DEBTS",
  } as const;
  const [activeFilter, setActiveFilter] = useState<
    (typeof filterOptions)[number]
  >(filterOptions[0]);

  const { mutate: deleteCustomer, isPending: deleteCustomerLoading } =
    useDeleteCustomerMutation({
      onSuccess: (data) => {
        console.log("data", data);
        showToast(data.message, "success");
        refetch();

        if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });

  const handleDeleteCustomer = (customer: any) => {
    console.log("customer", customer);
    setCustomerId(customer.id);
    deleteCustomer(customer?.id);
  };

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
    refetch,
  } = useGetCustomerQuery({
    params: {
      id: business_id,
      search: searchTerm,
      status: filterMapping[activeFilter],
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Refetch data when filter changes

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

    if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
      handleOpenNotSubscribeModal?.();
      return;
    }
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

  console.log("createCustomerSuccess", createCustomerSuccess);

  // console.log("CustomerData", CustomerData);

  return {
    form,
    onSubmit,

    CustomerSchema,

    handleDeleteCustomer,
    handleRowClick,
    CustomerData,
    deleteCustomerLoading,
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
