import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const CustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  wallet: z.string().min(1, "Wallet address is required"),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;

export const useCustomerHook = () => {
  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);
  const closeOpenCustomerModal = () => setOpenAddCustomerModal(false);
  const openCustomerModalFunc = () => setOpenAddCustomerModal(true);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      wallet: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: CustomerFormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone,
      wallet: values.wallet,
    };

    console.log("payload", payload);
  };

  return {
    openAddCustomerModal,
    form,
    closeOpenCustomerModal,
    onSubmit,
    CustomerSchema,
    openCustomerModalFunc,
  };
};
