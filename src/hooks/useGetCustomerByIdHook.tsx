import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useParams } from "next/navigation";

import { useFetchCustomerById } from "@/api/customer/fetch-customer-by-id";
import { useFetchCustomerPurchaseHistory } from "@/api/customer/fetch-customer-purchase-history";
import { useFetchCustomerWalletTrx } from "@/api/customer/fetch-customer-wallet-trx";
import { useUpdateWalletBalanceMutation } from "@/api/customer/update-wallet";

const WalletTrxSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  note: z.string().min(1, "Note is required"),
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
  const [selectedOption, setSelectedOption] = useState<string>("DEPOSIT");

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

  console.log("CustomerData----4444", CustomerData);

  const {
    data: CustomerPurchaseHistory,
    isLoading: CustomerPurchaseHistoryLoading,
  } = useFetchCustomerPurchaseHistory(customerId);
  const {
    data: CustomerWalletTrx,
    isLoading: CustomerWalletTrxLoading,
    refetch,
  } = useFetchCustomerWalletTrx(customerId);

  console.log("CustomerWalletTrx", CustomerWalletTrx);

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
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
  };

  console.log("selectedOption", selectedOption);

  const form = useForm<WalletTrxFormValues>({
    resolver: zodResolver(WalletTrxSchema),
    defaultValues: {
      amount: "",
      payment_method: "",
      note: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: WalletTrxFormValues) => {
    const payload = {
      amount: Number(values.amount),
      payment_method: values.payment_method,
      note: values.note,
    };
    console.log("payload", payload);

    updateWalletBalance({
      walletId: CustomerData?.data?.id, // Pass walletId directly
      payload: {
        amount: values.amount,
        payment_method: values.payment_method,
        type: selectedOption,
        note: values.note,
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
