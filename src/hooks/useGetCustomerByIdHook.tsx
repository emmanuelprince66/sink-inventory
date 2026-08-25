import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useParams } from "next/navigation";

import { useFetchCustomerById } from "@/api/customer/fetch-customer-by-id";
import { useFetchCustomerPurchaseHistory } from "@/api/customer/fetch-customer-purchase-history";
import { useFetchCustomerWalletTrx } from "@/api/customer/fetch-customer-wallet-trx";
import { useUpdateWalletBalanceMutation } from "@/api/customer/update-wallet";

/**
 * POST /customer/fund/{id}/ — CustomerTransaction.
 *
 * `amount` is typed as an integer server-side and `payment_method` accepts
 * only CASH or BANK. `note` is optional there, capped at 500 characters.
 */
export const FUND_PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank Transfer" },
] as const;

export const FUND_TYPES = [
  { value: "DEPOSIT", label: "Deposit", hint: "Money into the wallet" },
  { value: "WITHDRAWAL", label: "Withdrawal", hint: "Money out of the wallet" },
] as const;

export type FundType = (typeof FUND_TYPES)[number]["value"];

const WalletTrxSchema = z.object({
  // Kept as a string so the input stays controlled while empty; coerced to the
  // integer the endpoint wants at submit.
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number(value) > 0, "Enter an amount greater than zero")
    .refine(
      (value) => Number.isInteger(Number(value)),
      "Amount must be a whole number",
    ),
  payment_method: z.enum(["CASH", "BANK"], {
    message: "Select a payment method",
  }),
  note: z.string().max(500, "Keep the note under 500 characters").optional(),
});

export type WalletTrxFormValues = z.infer<typeof WalletTrxSchema>;

export const useGetCustomerByIdHook = ({
  closeModal,
}: {
  closeModal?: any;
}) => {
  const params = useParams();
  const customerId = params.id;
  const {
    data: CustomerData,
    isLoading: CustomerLoading,
    refetch: refetchCustomer,
  } = useFetchCustomerById(customerId);
  const [selectedOption, setSelectedOption] = useState<FundType>("DEPOSIT");

  const {
    mutate: updateWalletBalance,
    isPending: isUpdatingWallet,
    isSuccess: isWalletUpdated,
  } = useUpdateWalletBalanceMutation();

  useEffect(() => {
    if (isWalletUpdated) {
      refetchCustomer();
      if (closeModal) closeModal();
    }
  }, [isWalletUpdated]);

  const {
    data: CustomerPurchaseHistory,
    isLoading: CustomerPurchaseHistoryLoading,
  } = useFetchCustomerPurchaseHistory(customerId);
  const {
    data: CustomerWalletTrx,
    isLoading: CustomerWalletTrxLoading,
    refetch,
  } = useFetchCustomerWalletTrx(customerId);

  const [historyDetailsData, setHistoryDetailsData] = useState<any>({});
  const [openHistoryDetailsModal, setOpenHistoryDetailsModal] = useState(false);

  const openHistoryDetailsModalFunc = () => setOpenHistoryDetailsModal(true);
  const closeHistoryDetailsModal = () => setOpenHistoryDetailsModal(false);

  const [walletTrxDetails, setWalletTrxDetails] = useState<any>({});
  const [openWalletTrxDetailsModal, setOpenWalletTrxDetailsModal] =
    useState(false);

  const openWalletTrxDetailsModalFunc = () =>
    setOpenWalletTrxDetailsModal(true);
  const closeWalletTrxDetailsModal = () => setOpenWalletTrxDetailsModal(false);

  const handleHistoryRowClick = (row: any) => {
    console.log("Clicked row:", row.original);
    setHistoryDetailsData(row?.original);
    openHistoryDetailsModalFunc();
  };

  const handleWalletTrxRowClick = (row: any) => {
    console.log("Clicked row yy:", row.original);
    setWalletTrxDetails(row?.original);
    openWalletTrxDetailsModalFunc();
  };
  const handleSelectOption = (option: FundType) => {
    setSelectedOption(option);
  };

  const form = useForm<WalletTrxFormValues>({
    resolver: zodResolver(WalletTrxSchema) as any,
    defaultValues: {
      amount: "",
      payment_method: undefined,
      note: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: WalletTrxFormValues) => {
    // The route is keyed on the customer, not on a separate wallet record —
    // params.id is that customer, and it is there before the detail query
    // resolves.
    const fundId = (customerId as string) ?? CustomerData?.data?.id;

    updateWalletBalance({
      walletId: fundId,
      payload: {
        amount: Number(values.amount),
        payment_method: values.payment_method,
        type: selectedOption,
        // Optional server-side; sending "" would fail its minLength.
        ...(values.note?.trim() ? { note: values.note.trim() } : {}),
      },
    });
  };

  return {
    CustomerData,
    CustomerLoading,
    CustomerPurchaseHistory,
    CustomerWalletTrx,
    openHistoryDetailsModal,
    handleWalletTrxRowClick,
    historyDetailsData,
    form,

    onSubmit,
    openWalletTrxDetailsModal,
    walletTrxDetails,
    openHistoryDetailsModalFunc,
    selectedOption,
    closeHistoryDetailsModal,
    closeWalletTrxDetailsModal,
    isUpdatingWallet,
    handleSelectOption,
    handleHistoryRowClick,
    CustomerWalletTrxLoading,
    CustomerPurchaseHistoryLoading,
  };
};
