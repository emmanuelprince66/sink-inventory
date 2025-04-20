import { useGetAllBusinessQuery } from "@/api/business/get-business";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useCreateBusinessMutation } from "@/api/business/create-business";

const businessSchema = z.object({
  logo: z.any().optional(), // Handle file input
  name: z.string().min(1, "Business name is required"),
  type: z.string().min(1, "Business type is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State/Province is required"),
  city: z.string().min(1, "City/Town is required"),
  street: z.string().min(1, "Street is required"),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

export const useBusinessHook = () => {
  const { mutate: CreateBusiness, isPending: isSubmitting } =
    useCreateBusinessMutation();
  const [openCreateBusinessModal, setOpenCreateBusinessModal] = useState(false);

  console.log("openCreate", openCreateBusinessModal);

  const closeCreateBusinessModal = () => setOpenCreateBusinessModal(false);
  const openCreateBusinessModalFunc = () => setOpenCreateBusinessModal(true);
  const { data: AllBusinessData, isLoading: AllBusinessLoading } =
    useGetAllBusinessQuery();

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      logo: undefined,
      name: "",
      type: "",
      country: "",
      state: "",
      city: "",
      street: "",
    },
  });
  const onSubmit = (values: BusinessFormValues) => {
    CreateBusiness(values, {
      onError: (error) => {
        // Handle specific API errors
        if (error.statusCode === 401) {
          console.log("error--5", error);
        }
      },
    });
  };
  console.log("data---3", AllBusinessData);

  return {
    AllBusinessData,
    AllBusinessLoading,
    form,
    onSubmit,
    openCreateBusinessModal,
    openCreateBusinessModalFunc,
    isSubmitting,
    closeCreateBusinessModal,
    setOpenCreateBusinessModal,
  };
};
