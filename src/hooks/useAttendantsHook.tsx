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
  role: z.enum(
    ["ATTENDANT", "ADMIN-ATTENDANT", "PHARMACIST", "INVENTORY-MANAGER"],
    {
      required_error: "Please select a role",
    },
  ),
  watchlist: z.boolean(),
});

export type AddStaffFormValues = z.infer<typeof staffSchema>;

const EditStaffSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(50),
  lastname: z.string().min(1, "Last name is required").max(50),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(
    ["ATTENDANT", "ADMIN-ATTENDANT", "PHARMACIST", "INVENTORY-MANAGER"],
    {
      required_error: "Please select a role",
    },
  ),
  watchlist: z.boolean(),
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

  const {
    mutate: editAttendant,
    isPending: editAttendantLoading,
    isSuccess: editAttendantSuccess,
  } = useEditAttendantMutation();

  useEffect(() => {
    if (editAttendantSuccess) {
      refetch();
      if (closeModal) closeModal();
      // Optional: Invalidate queries or update cache
    }
  }, [editAttendantSuccess, refetch, closeModal]);

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
      watchlist: false,
    },
    mode: "onChange",
  });

  const editform = useForm<EditStaffFormValues>({
    resolver: zodResolver(EditStaffSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      role: undefined as any,
      watchlist: false,
    },
    mode: "onChange",
  });

  const onSubmit = (values: AddStaffFormValues) => {
    const payload: any = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone,
      role: values.role,
    };

    // Only include watchlist if role is PHARMACIST
    if (values.role === "PHARMACIST") {
      payload.watchlist = values.watchlist;
    }

    console.log("payload", payload);

    createStaff({
      payload,
      businessId: business_id,
    });
  };

  const ROLE_PERMISSIONS = {
    ATTENDANT: {
      name: "Attendant",
      permissions: [
        "Finalize transaction",
        "See orders and manage order transactions",
        "See transactions",
      ],
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
    "ADMIN-ATTENDANT": {
      name: "Admin Attendant",
      permissions: [
        "Make pre-sale",
        "Sell watch listed items",
        "See transactions",
        "Finalize transaction",
      ],
      color: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600",
    },
    PHARMACIST: {
      name: "Pharmacist",
      permissions: [
        "Load inventory",
        "See all transactions and performance",
        "Full system access",
      ],
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600",
    },
    "INVENTORY-MANAGER": {
      name: "Inventory Manager",
      permissions: [
        "Add product",
        "Restock product",
        "Edit selling price",
        "Adjust stock",
        "View sold history",
      ],
      color: "bg-lime-50 border-lime-200",
      iconColor: "text-lime-600",
    },
  };

  useEffect(() => {
    if (attendantData && attendantId && !AttendantLoading) {
      editform.reset({
        firstname: attendantData?.data?.firstname,
        lastname: attendantData?.data?.lastname,
        phone: attendantData?.data?.phone || "",
        role: attendantData?.data?.role || undefined,
        watchlist: attendantData?.data?.watchlist || false,
      });
    }
  }, [attendantData, AttendantLoading, editform, attendantId]);

  const onSubmitEditForm = (values: EditStaffFormValues) => {
    const payload: any = {
      firstname: values.firstname,
      lastname: values.lastname,
      phone: values.phone,
      role: values.role,
    };

    // Only include watchlist if role is PHARMACIST
    if (values.role === "PHARMACIST") {
      payload.watchlist = values.watchlist;
    }

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
    ROLE_PERMISSIONS,
    editAttendantLoading,
    AttendantLoading,
    deleteAttendantLoading,
    createStaffLoading,
  };
};
