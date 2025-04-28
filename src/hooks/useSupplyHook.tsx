import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateSupplierMutation } from "@/api/supply/create-supplier";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
const SupplySchema = z.object({
  name: z.string().min(1, "Supply name is required"),
  phone: z.string().min(1, "Phone number is required"),
  wallet: z.string().min(1, "Wallet address is required"),
});

export type SupplyFormValues = z.infer<typeof SupplySchema>;

export const useSupplyHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data: SupplierData, isLoading: SupplierLoading } =
    useFetchSupplierDataQuery(business_id);

  const { mutate: createSupplier, isPending: createSupplierLoading } =
    useCreateSupplierMutation({
      businessId: business_id, // Convert null to undefined
    });
  const [openAddSupplyModal, setOpenAddSupplyModal] = useState(false);
  const closeOpenSupplyModal = () => setOpenAddSupplyModal(false);
  const openSupplyModalFunc = () => setOpenAddSupplyModal(true);
  const router = useRouter();

  const form = useForm<SupplyFormValues>({
    resolver: zodResolver(SupplySchema),
    defaultValues: {
      name: "",
      phone: "",
      wallet: "",
    },
    mode: "onChange",
  });

  const handleRowClick = (row: any) => {
    router.push(`/supply/${row.original.id}`);
    console.log("Clicked row:", row.original);
    // console.log("Clicked row ID:", row.id);

    // Perform any additional actions here
  };

  const onSubmit = (values: SupplyFormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone,
      wallet: values.wallet,
    };

    console.log("payload", payload);

    createSupplier({
      payload,
      businessId: business_id,
    });
  };

  return {
    openAddSupplyModal,
    form,
    SupplierData,
    SupplierLoading,
    closeOpenSupplyModal,
    createSupplierLoading,
    handleRowClick,
    onSubmit,
    SupplySchema,
    openSupplyModalFunc,
  };
};
