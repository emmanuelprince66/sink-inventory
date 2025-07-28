import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useChangePinMutation } from "@/api/transactions/change-pin";
import { useFetchTrxBank } from "@/api/transactions/fetch-bank";
import { useFetchTransactionQuery } from "@/api/transactions/fetch-transactions";
import { useCreatePinMutation } from "@/api/transactions/set-pin";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

// Define the schema for pin validation
const pinSchema = z
  .object({
    pin: z.string().length(4, "Pin must be 4 digits"),
    confirmPin: z.string().length(4, "Confirm Pin must be 4 digits"),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "Pins don't match",
    path: ["confirmPin"],
  });
export type pinSetUpFormValues = z.infer<typeof pinSchema>;

const changePinSchema = z.object({
  old_pin: z.string().length(4, "Pin must be 4 digits"),
  new_pin: z.string().length(4, " Pin must be 4 digits"),
});

export type changePinFormValues = z.infer<typeof changePinSchema>;

export const useTransactionsHook = ({
  page,
  searchInput,
  type,
  dateRange,
  closeModal,
  setShowPinModal,
}: any) => {
  // console.log("type", type);
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;
  const { user } = useUserRole();
  const { showToast } = useToast();
  const { mutate: CreatePin, isPending: CreatePinLoading } =
    useCreatePinMutation();
  const { mutate: ChangePin, isPending: ChangePinLoading } =
    useChangePinMutation();

  console.log("user", user);
  const business_id = useBusinessStore((state) => state.business_id);
  const {
    data: BankData,
    isLoading: BankDataLoading,
    refetch: refetchBank,
  } = useFetchBankQuery(business_id);
  const {
    data: BankTrxData,
    isLoading: BankTrxDataLoading,
    refetch: refetchTrxBank,
  } = useFetchTrxBank(business_id);

  console.log("BankTrxData", BankTrxData);

  const {
    data: TrxData,
    isLoading: TrxDataLoading,
    refetch: TrxDataRefetch,
    // isRefetching: isRefetchingInventory,
  } = useFetchTransactionQuery({
    params: {
      page,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
      limit: 20,
      id: business_id,
      search: searchTerm,
      type: type,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const pinForm = useForm<pinSetUpFormValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
  });

  const changePinForm = useForm<changePinFormValues>({
    resolver: zodResolver(changePinSchema),
    defaultValues: {
      old_pin: "",
      new_pin: "",
    },
  });
  const onSubmitPinForm = (values: pinSetUpFormValues) => {
    // By this point, Zod has already validated that pins match
    console.log("Submitting pin:", values.pin);

    const insert = {
      pin: values.pin,
    };
    setShowPinModal(false);

    CreatePin(insert, {
      onSuccess: (data) => {
        closeModal();

        TrxDataRefetch();
      },
    });
  };
  const onSubmitChangePinForm = (values: changePinFormValues) => {
    // By this point, Zod has already validated that pins match
    ChangePin(values, {
      onSuccess: (data) => {
        closeModal();
        TrxDataRefetch();
      },
    });
  };

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "EXPENSES",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return {
    BankData,
    TrxData,
    TrxDataLoading,
    user,
    BankDataLoading,
    pinForm,
    onSubmitPinForm,
    CategoriesData,
    CreatePinLoading,
    ChangePinLoading,
    changePinForm,
    onSubmitChangePinForm,
    CategoriesDataLoading,
  };
};
