import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useParams } from "next/navigation";

import { useFetchSupplierByIdQuery } from "@/api/supply/fetch-single-supplier";
import { useUpdateSupplyWalletMutation } from "@/api/supply/update-balance";

const WalletTrxSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  payment_type: z.string().min(1, "Payment type is required"),
  note: z.string().min(1, "Note is required"),
});

export type WalletTrxFormValues = z.infer<typeof WalletTrxSchema>;

export const useFetchSingleSupplyHook = (id?: string) => {
  const params = useParams();
  const supplierId = id || params.id;
  const { data: SupplierByIdData, isLoading: SupplierByIdLoading } =
    useFetchSupplierByIdQuery(supplierId);

  const { mutate: updateWalletSupplyWallet, isPending: isUpdatingWallet } =
    useUpdateSupplyWalletMutation();

  const [openUpdateSupplyWalletModal, setOpenUpdateSupplyWalletModal] =
    useState(false);

  const [showSupplyHistoryDetailsModal, setShowSupplyHistoryDetailsModal] =
    useState(false);
  const closeSupplyHistoryDetailsModal = () =>
    setShowSupplyHistoryDetailsModal(false);
  const openSupplyHistoryDetailsModalFunc = () =>
    setShowSupplyHistoryDetailsModal(true);

  const [supplierDetails, setSupplierDetails] = useState<any>({});
  const closeUpdateSupplyWalletModal = () =>
    setOpenUpdateSupplyWalletModal(false);
  const openUpdateSupplyModalFunc = () => setOpenUpdateSupplyWalletModal(true);
  const handleSupplyHistoryRowClick = (row: any) => {
    console.log("row", row.original);
    setSupplierDetails(row?.original);
    openSupplyHistoryDetailsModalFunc();
  };

  const form = useForm<WalletTrxFormValues>({
    resolver: zodResolver(WalletTrxSchema),
    defaultValues: {
      amount: "",
      payment_method: "",
      payment_type: "",
      note: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: WalletTrxFormValues) => {
    const payload = {
      amount: Number(values.amount),
      method: values.payment_method,
      note: values.note,
      type: values.payment_type,
    };
    console.log("payload", payload);

    updateWalletSupplyWallet({
      walletId: SupplierByIdData?.data?.id, // Pass walletId directly
      payload,
    });

    closeUpdateSupplyWalletModal();
  };

  return {
    SupplierByIdData,
    openUpdateSupplyWalletModal,
    closeUpdateSupplyWalletModal,
    SupplierByIdLoading,
    isUpdatingWallet,
    onSubmit,
    form,
    updateWalletSupplyWallet,
    showSupplyHistoryDetailsModal,
    closeSupplyHistoryDetailsModal,
    openUpdateSupplyModalFunc,
    supplierDetails,
    openSupplyHistoryDetailsModalFunc,
    handleSupplyHistoryRowClick,
  };
};
