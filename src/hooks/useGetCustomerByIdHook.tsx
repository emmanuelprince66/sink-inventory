import { useFetchCustomerById } from "@/api/customer/fetch-customer-by-id";
import { useFetchCustomerPurchaseHistory } from "@/api/customer/fetch-customer-purchase-history";
import { useFetchCustomerWalletTrx } from "@/api/customer/fetch-customer-wallet-trx";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { z } from "zod";
import { useUpdateWalletBalanceMutation } from "@/api/customer/update-wallet";

const WalletTrxSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  note: z.string().min(1, "Note is required"),
});

export type WalletTrxFormValues = z.infer<typeof WalletTrxSchema>;

export const useGetCustomerByIdHook = (id?: string) => {
  const params = useParams();
  const customerId = id || params.id;
  const { data: CustomerData, isLoading: CustomerLoading } =
    useFetchCustomerById(customerId);

  const { mutate: updateWalletBalance, isPending: isUpdatingWallet } =
    useUpdateWalletBalanceMutation();

  console.log("CustomerData----4444", CustomerData);

  const {
    data: CustomerPurchaseHistory,
    isLoading: CustomerPurchaseHistoryLoading,
  } = useFetchCustomerPurchaseHistory(id);
  const { data: CustomerWalletTrx, isLoading: CustomerWalletTrxLoading } =
    useFetchCustomerWalletTrx(id);

  const [historyDetailsData, setHistoryDetailsData] = useState<any>({});
  const [openHistoryDetailsModal, setOpenHistoryDetailsModal] = useState(false);

  const openHistoryDetailsModalFunc = () => setOpenHistoryDetailsModal(true);
  const closeHistoryDetailsModal = () => setOpenHistoryDetailsModal(false);

  const [walletTrxDetails, setWalletTrxDetails] = useState<any>({});
  const [openWalletTrxDetailsModal, setOpenWalletTrxDetailsModal] =
    useState(false);

  const [openUpdateCustomerWalletModal, setOpenUpdateCustomerWalletModal] =
    useState(false);

  const closeOpenUpdateCustomerWalletModal = () =>
    setOpenUpdateCustomerWalletModal(false);
  const openUpdateCustomerWalletModalFunc = () => {
    setOpenUpdateCustomerWalletModal(true);
  };
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
    closeOpenUpdateCustomerWalletModal,
    openUpdateCustomerWalletModalFunc,
    openUpdateCustomerWalletModal,
    onSubmit,
    openWalletTrxDetailsModal,
    walletTrxDetails,
    openHistoryDetailsModalFunc,
    closeHistoryDetailsModal,
    closeWalletTrxDetailsModal,
    isUpdatingWallet,
    handleHistoryRowClick,
    CustomerWalletTrxLoading,
    CustomerPurchaseHistoryLoading,
  };
};
