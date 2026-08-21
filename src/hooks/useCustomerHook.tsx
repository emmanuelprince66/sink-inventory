import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { City, State } from "country-state-city";
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
import {
  AddressSuggestion,
  cityCentroid,
  coordinatesPayload,
  resolveCoordinates,
} from "@/utils/address";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useDebounce } from "./useDebounce";

const CustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().optional(),
  // State holds the NG state's ISO code (matches the order delivery address
  // flow) — translated to its full name in the submit payload below.
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  // Resolved by the address autocomplete, never typed. Held as strings to
  // match the API's own typing everywhere else coordinates appear.
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;

// Create this custom hook in your hooks folder

export const useCustomerHook = ({
  closeModal,
  handleOpenNotSubscribeModal,
  dateRange,
  page,
}: {
  closeModal?: () => void;
  handleOpenNotSubscribeModal?: () => void;
  dateRange?: any;
  page?: number;
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
  // Every status the customer endpoint accepts, per its query-param spec.
  const filterOptions = [
    "All",
    "Most Active",
    "New",
    "Least Active",
    "Debts",
    "Active",
    "At Risk",
    "Inactive",
  ] as const;

  const filterMapping = {
    All: "",
    "Most Active": "MOST_ACTIVE",
    "Least Active": "LEAST_ACTIVE",
    New: "NEW",
    Debts: "DEBTS",
    Active: "ACTIVE",
    "At Risk": "AT_RISK",
    Inactive: "INACTIVE",
  } as const;
  const [activeFilter, setActiveFilter] = useState<
    (typeof filterOptions)[number]
  >(filterOptions[0]);
  const [activeTier, setActiveTier] = useState("");
  // No segment query param on the customer endpoint yet; held so the control
  // keeps its selection and is ready to send the moment one exists.
  const [activeSegment, setActiveSegment] = useState("");

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
      tier: activeTier,
      segment: activeSegment,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
      limit: 30,
      page,
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
      state: "",
      city: "",
      address: "",
      latitude: "",
      longitude: "",
    },
    mode: "onChange",
  });

  // Same NG state/city source as the order delivery address flow
  // (useOrderDeliveryHook) — state is stored as its ISO code, city list
  // depends on the selected state.
  const stateList = useMemo(() => State.getStatesOfCountry("NG"), []);
  const selectedState = form.watch("state");
  const cityList = useMemo(
    () => (selectedState ? City.getCitiesOfState("NG", selectedState) : []),
    [selectedState],
  );

  const handleStateChange = (value: string) => {
    form.setValue("state", value);
    form.setValue("city", "");
    // A hand-picked state invalidates coordinates resolved for the old one.
    clearAddressCoordinates();
  };

  // Applies a picked autocomplete suggestion. `state` is stored as an ISO code
  // here (same convention as the order delivery form), so the resolved state
  // name is mapped back before it's set.
  const applyAddressSuggestion = (suggestion: AddressSuggestion) => {
    const matchedState = stateList.find(
      (s) =>
        s.isoCode === suggestion.stateCode ||
        s.name.toLowerCase() === suggestion.state.toLowerCase(),
    );

    form.setValue("address", suggestion.address || suggestion.label, {
      shouldValidate: true,
    });
    if (matchedState) form.setValue("state", matchedState.isoCode);
    if (suggestion.city) form.setValue("city", suggestion.city);
    form.setValue("latitude", suggestion.latitude);
    form.setValue("longitude", suggestion.longitude);
  };

  const clearAddressCoordinates = () => {
    form.setValue("latitude", "");
    form.setValue("longitude", "");
  };

  const onSubmit = (values: CustomerFormValues) => {
    // The backend's `address` field is required *within* the nested
    // CustomerAddress object once that object is sent at all — so a
    // city/state picked without a street just silently gets dropped
    // (and the request would 400) unless we ask for the street too.
    if ((values.city || values.state) && !values.address?.trim()) {
      form.setError("address", {
        message: "Street address is required when city/state is set",
      });
      return;
    }

    const stateName =
      stateList.find((s) => s.isoCode === values.state)?.name || values.state;

    // Street-level coordinates from the autocomplete, else the city centroid.
    // Backend is still adding latitude/longitude to the customer-address
    // model — until it lands, these keys are simply ignored by the serializer.
    // Once they land, saved customers stop needing a fresh lookup on every
    // order they place.
    const coords = resolveCoordinates(
      { latitude: values.latitude, longitude: values.longitude },
      cityCentroid(values.state, values.city),
    );

    const payload = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      ...(values.address?.trim() && {
        address: {
          address: values.address.trim(),
          city: values.city || undefined,
          state: stateName || undefined,
          country: "Nigeria",
          is_default: true,
          ...coordinatesPayload(coords),
        },
      }),
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

    stateList,
    cityList,
    handleStateChange,
    applyAddressSuggestion,
    clearAddressCoordinates,

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
    activeTier,
    setActiveTier,
    activeSegment,
    setActiveSegment,
  };
};
