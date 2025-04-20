import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SupplySchema = z.object({
  name: z.string().min(1, "Supply name is required"),
  phone: z.string().min(1, "Phone number is required"),
  wallet: z.string().min(1, "Wallet address is required"),
});

export type SupplyFormValues = z.infer<typeof SupplySchema>;

export const useSupplyHook = () => {
  const [openAddSupplyModal, setOpenAddSupplyModal] = useState(false);
  const closeOpenSupplyModal = () => setOpenAddSupplyModal(false);
  const openSupplyModalFunc = () => setOpenAddSupplyModal(true);

  const form = useForm<SupplyFormValues>({
    resolver: zodResolver(SupplySchema),
    defaultValues: {
      name: "",
      phone: "",
      wallet: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: SupplyFormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone,
      wallet: values.wallet,
    };

    console.log("payload", payload);
  };

  return {
    openAddSupplyModal,
    form,
    closeOpenSupplyModal,
    onSubmit,
    SupplySchema,
    openSupplyModalFunc,
  };
};
