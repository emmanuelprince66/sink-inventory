import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRouter } from "next/navigation";
import { useToast } from "./toast/useToast";

import { useCreateSupplierMutation } from "@/api/supply/create-supplier";
import { useDeleteSupplierMutation } from "@/api/supply/delete-supplier";
import { useFetchSupplierDataQuery } from "@/api/supply/fetch-all-supplier";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
const SupplySchema = z.object({
  name: z.string().min(1, "Supply name is required"),
  phone: z.string().min(1, "Phone number is required"),
  wallet: z.string().min(1, "Wallet address is required"),
});

export type SupplyFormValues = z.infer<typeof SupplySchema>;

export const useSupplyHook = ({ closeModal }: { closeModal?: () => void }) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const {
    data: SupplierData,
    isLoading: SupplierLoading,
    refetch,
  } = useFetchSupplierDataQuery(business_id);
  const { showToast } = useToast();

  const [supplierId, setSupplierId] = useState("");

  const { mutate: createSupplier, isPending: createSupplierLoading } =
    useCreateSupplierMutation({
      businessId: business_id, // Convert null to undefined
      onSuccess: (data) => {
        console.log("data", data);
        refetch();
        if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
    });

  const router = useRouter();

  const { mutate: deleteSupplier, isPending: deleteSupplierLoading } =
    useDeleteSupplierMutation({
      onSuccess: (data) => {
        console.log("data", data);
        showToast(data.message, "success");
        refetch();

        if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });

  const handleDeleteSupplier = (supplier: any) => {
    deleteSupplier(supplier.id);
  };
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
    form,
    SupplierData,
    SupplierLoading,
    createSupplierLoading,
    handleDeleteSupplier,
    deleteSupplierLoading,
    handleRowClick,
    onSubmit,
    SupplySchema,
  };
};
