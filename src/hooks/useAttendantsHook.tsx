import { useCreateStaffMutation } from "@/api/attendants/add.-attendants";
import { useDeleteAttendantMutation } from "@/api/attendants/delete-attendants";
import { useEditAttendantMutation } from "@/api/attendants/edit-attendants";
import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useFetchAttendantByIdQuery } from "@/api/attendants/get-attendant-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
const EditStaffSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(50),
  lastname: z.string().min(1, "Last name is required").max(50),
  phone: z.string().min(1, "Phone number is required"),
  is_admin: z.boolean().optional(),
});

export type EditStaffFormValues = z.infer<typeof EditStaffSchema>;

export const useAttendantsHook = ({
  closeModal,
  attendantId,
}: {
  closeModal?: () => void;
  attendantId?: string;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const {
    data: AttendantsData,
    isLoading: AttendantsLoading,
    refetch,
  } = useFetchAttendants(business_id);

  const { showToast } = useToast();

  const { data: attendantData, isLoading: AttendantLoading } =
    useFetchAttendantByIdQuery(attendantId, { enabled: !!attendantId });
  console.log("attendantData----4", attendantData);

  const {
    mutate: editAttendant,
    isPending: editAttendantLoading,
    isSuccess: editAttendantSuccess,
  } = useEditAttendantMutation();

  useEffect(() => {
    if (editAttendantSuccess) {
      refetch();
      if (closeModal) closeModal();
      showToast("Attendant updated successfully", "success");
      // Optional: Invalidate queries or update cache
    }
  }, [editAttendantSuccess]);
  const { mutate: deleteAttendant, isPending: deleteAttendantLoading } =
    useDeleteAttendantMutation({
      onSuccess: (data) => {
        console.log("data", data);
        refetch();
        if (closeModal) closeModal();
        showToast(data.message, "success");

        //   if (closeDellBankModal) closeDellBankModal();

        // if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });
  const handleDeleteAttendant = (staff: any) => {
    console.log("customer", staff);
    deleteAttendant(staff?.id);
  };

  const {
    mutate: createStaff,
    isPending: createStaffLoading,
    isSuccess: createStaffSuccess,
  } = useCreateStaffMutation({
    businessId: business_id,
    onSuccess: (data) => {
      refetch();
      if (closeModal) closeModal();
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

  const editform = useForm<EditStaffFormValues>({
    resolver: zodResolver(EditStaffSchema),
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

  useEffect(() => {
    if (attendantData && attendantId && !AttendantLoading) {
      editform.reset({
        firstname: attendantData?.data?.firstname,
        lastname: attendantData?.data?.lastname,
        phone: attendantData?.data?.phone || "",
        is_admin: attendantData?.data?.is_admin || false,
      });
    }
  }, [attendantData, AttendantLoading, editform, attendantId]);
  const onSubmitEditForm = (values: EditStaffFormValues) => {
    const payload = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone,
      is_admin: values.is_admin,
    };

    console.log("payload", payload);

    editAttendant({
      payload,
      attendantId: attendantId as any,
    });
  };

  return {
    AttendantsData,
    AttendantsLoading,
    attendantData,
    form,
    editform,
    onSubmitEditForm,
    onSubmit,
    handleDeleteAttendant,
    deleteAttendant,
    editAttendant,
    editAttendantLoading,
    AttendantLoading,
    deleteAttendantLoading,
    createStaffLoading,
  };
};
