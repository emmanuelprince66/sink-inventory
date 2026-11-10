import { useCreateStaffMutation } from "@/api/attendants/add.-attendants";
import { useDeleteAttendantMutation } from "@/api/attendants/delete-attendants";
import { useEditAttendantMutation } from "@/api/attendants/edit-attendants";
import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useFetchAttendantByIdQuery } from "@/api/attendants/get-attendant-by-id";
import { useUpdateAttendantBusinessesMutation } from "@/api/attendants/update-attendant-business";
import { useGetAllBusinessQuery } from "@/api/business/get-business";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { MatrixSave } from "./useStaffPermissionMatrix";
import { useToast } from "./toast/useToast";

const staffSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(50),
  lastname: z.string().min(1, "Last name is required").max(50),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(
    [
      "ATTENDANT",
      "ADMIN-ATTENDANT",
      "MANAGER",
      "PHARMACIST",
      "ACCOUNTANT",
      "INVENTORY-MANAGER",
      "PRODUCTION-MANAGER",
    ],
    {
      required_error: "Please select a role",
    },
  ),
});

export type AddStaffFormValues = z.infer<typeof staffSchema>;

const EditStaffSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(50),
  lastname: z.string().min(1, "Last name is required").max(50),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(
    [
      "ATTENDANT",
      "ADMIN-ATTENDANT",
      "MANAGER",
      "PHARMACIST",
      "ACCOUNTANT",
      "INVENTORY-MANAGER",
      "PRODUCTION-MANAGER",
    ],
    {
      required_error: "Please select a role",
    },
  ),
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
  const queryClient = useQueryClient();

  const { data: attendantData, isLoading: AttendantLoading } =
    useFetchAttendantByIdQuery(attendantId, { enabled: !!attendantId });

  const {
    data: AllBusinessData,
    isLoading: AllBusinessLoading,
    refetch: businessRefetch,
  } = useGetAllBusinessQuery();

  const {
    mutate: editAttendant,
    isPending: editAttendantLoading,
    isSuccess: editAttendantSuccess,
  } = useEditAttendantMutation();

  const {
    mutate: updateAttendantBusinesses,
    isPending: updateBusinessesLoading,
  } = useUpdateAttendantBusinessesMutation({
    onSuccess: (data: any) => {
      refetch();
      showToast(
        data.message || "Attendant businesses updated successfully",
        "success",
      );
    },
    onError: (error: any) => {
      showToast(error.message || "Failed to update businesses", "error");
    },
  });

  useEffect(() => {
    if (editAttendantSuccess) {
      refetch();
      queryClient.invalidateQueries({
        queryKey: [queryKey.attendants.getAttendantById],
      });
      if (closeModal) closeModal();
    }
  }, [editAttendantSuccess, refetch, closeModal, queryClient]);

  const { mutate: deleteAttendant, isPending: deleteAttendantLoading } =
    useDeleteAttendantMutation({
      onSuccess: (data) => {
        console.log("data", data);
        refetch();
        if (closeModal) closeModal();
        showToast(data.message, "success");
      },
    });

  const handleDeleteAttendant = (staff: any) => {
    console.log("customer", staff);
    deleteAttendant(staff?.id);
  };

  const handleUpdateBusinesses = (
    attendantId: string,
    businessIds: string[],
  ) => {
    updateAttendantBusinesses({
      attendantId,
      payload: { business_ids: businessIds },
    });
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
      role: undefined as any,
    },
    mode: "onChange",
  });

  const editform = useForm<EditStaffFormValues>({
    resolver: zodResolver(EditStaffSchema),
    mode: "onSubmit",
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      role: undefined as any,
    },
  });

  const onSubmit = (
    values: AddStaffFormValues,
    save: MatrixSave = {},
  ) => {
    const payload: any = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone,
      role: values.role,
    };

    // Left out when it matches the role's defaults.
    if (save.setPermissions) payload.set_permissions = save.setPermissions;
    // Saved permissions couldn't be read: save the details, keep them as is.
    if (save.keepSaved) payload.keep_saved_permissions = true;

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
        role: attendantData?.data?.role || undefined,
      });
    }
  }, [attendantData, AttendantLoading, editform, attendantId]);

  const onSubmitEditForm = (
    values: EditStaffFormValues,
    save: MatrixSave = {},
  ) => {
    const payload: any = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone,
      role: values.role,
    };

    // Left out when it matches the role's defaults.
    if (save.setPermissions) payload.set_permissions = save.setPermissions;
    // Saved permissions couldn't be read: save the details, keep them as is.
    if (save.keepSaved) payload.keep_saved_permissions = true;

    console.log("payload", payload);

    editAttendant(
      {
        payload,
        attendantId: attendantId as any,
      },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: [queryKey.attendants.getPermissions],
          }),
      },
    );
  };

  return {
    AttendantsData,
    AttendantsLoading,
    attendantData,
    AllBusinessData,
    AllBusinessLoading,
    form,
    editform,
    onSubmitEditForm,
    onSubmit,
    handleDeleteAttendant,
    handleUpdateBusinesses,
    deleteAttendant,
    editAttendant,
    updateAttendantBusinesses,
    editAttendantLoading,
    AttendantLoading,
    deleteAttendantLoading,
    createStaffLoading,
    updateBusinessesLoading,
    businessRefetch,
    // Computed values and helpers for clean UI — use attendantId to pick the right form
    selectedRole: attendantId
      ? editform.watch("role")
      : form.watch("role"),
  };
};
