import { useCreateStaffMutation } from "@/api/attendants/add.-attendants";
import { useDeleteAttendantMutation } from "@/api/attendants/delete-attendants";
import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";
const staffSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(50),
  lastname: z.string().min(1, "Last name is required").max(50),
  phone: z.string().min(1, "Phone number is required"),
  is_admin: z.boolean().optional(),
});

export type AddStaffFormValues = z.infer<typeof staffSchema>;

export const useAttendantsHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { data: AttendantsData, isLoading: AttendantsLoading } =
    useFetchAttendants(business_id);

  const { showToast } = useToast();

  const { mutate: deleteAttendant, isPending: deleteAttendantLoading } =
    useDeleteAttendantMutation({
      onSuccess: (data) => {
        console.log("data", data);
        showToast(data.message, "success");

        //   if (closeDellBankModal) closeDellBankModal();

        // if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });
  const handleDeleteAttendant = (bank: any) => {
    console.log("customer", bank);
    deleteAttendant(bank?.id);
  };

  const {
    mutate: createStaff,
    isPending: createStaffLoading,
    isSuccess: createStaffSuccess,
  } = useCreateStaffMutation({
    businessId: business_id,
    onSuccess: (data) => {
      showToast(data.message, "success");
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  const form = useForm<AddStaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      is_admin: false,
    },
    mode: "onChange",
  });

  const onSubmit = (values: AddStaffFormValues) => {
    const payload = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone,
      is_admin: values.is_admin,
    };

    console.log("payload", payload);

    createStaff({
      payload,
      businessId: business_id,
    });
  };

  return {
    AttendantsData,
    AttendantsLoading,
    form,
    onSubmit,
    createStaffLoading,
  };
};
