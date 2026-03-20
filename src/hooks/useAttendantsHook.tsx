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
    [
      "ATTENDANT",
      "ADMIN-ATTENDANT",
      "PHARMACIST",
      "ACCOUNTANT",
      "INVENTORY-MANAGER",
      "PRODUCTION-MANAGER",
    ],
    {
      required_error: "Please select a role",
    },
  ),
  // Pharmacist permissions
  canCreatePresale: z.boolean().optional(),
  canLoadPresalesAndFinalize: z.boolean().optional(),
  canSellWatchlisted: z.boolean().optional(),
  // Inventory Manager permissions
  canManageMultipleBranches: z.boolean().optional(),
  canRestock: z.boolean().optional(),
  canMoveToProduction: z.boolean().optional(),
  canTransfer: z.boolean().optional(),
  canReturnProduct: z.boolean().optional(),
  canRecordDamaged: z.boolean().optional(),
  // Accountant permissions
  canViewTransactions: z.boolean().optional(),
  canAccessAllTransactions: z.boolean().optional(),
  canViewInventory: z.boolean().optional(),
  canAccessAllBranches: z.boolean().optional(),
  // Production Manager permissions
  canAccessInventory: z.boolean().optional(),
  canRestockProduction: z.boolean().optional(),
  canRecordDamagedProduction: z.boolean().optional(),
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
      "PHARMACIST",
      "ACCOUNTANT",
      "INVENTORY-MANAGER",
      "PRODUCTION-MANAGER",
    ],
    {
      required_error: "Please select a role",
    },
  ),
  // Pharmacist permissions
  canCreatePresale: z.boolean().optional(),
  canLoadPresalesAndFinalize: z.boolean().optional(),
  canSellWatchlisted: z.boolean().optional(),
  // Inventory Manager permissions
  canManageMultipleBranches: z.boolean().optional(),
  canRestock: z.boolean().optional(),
  canMoveToProduction: z.boolean().optional(),
  canTransfer: z.boolean().optional(),
  canReturnProduct: z.boolean().optional(),
  canRecordDamaged: z.boolean().optional(),
  // Accountant permissions
  canViewTransactions: z.boolean().optional(),
  canAccessAllTransactions: z.boolean().optional(),
  canViewInventory: z.boolean().optional(),
  canAccessAllBranches: z.boolean().optional(),
  // Production Manager permissions
  canAccessInventory: z.boolean().optional(),
  canRestockProduction: z.boolean().optional(),
  canRecordDamagedProduction: z.boolean().optional(),
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
      // Pharmacist permissions
      canCreatePresale: false,
      canLoadPresalesAndFinalize: false,
      canSellWatchlisted: false,
      // Inventory Manager permissions
      canManageMultipleBranches: false,
      canRestock: false,
      canMoveToProduction: false,
      canTransfer: false,
      canReturnProduct: false,
      canRecordDamaged: false,
      // Accountant permissions
      canViewTransactions: false,
      canAccessAllTransactions: false,
      canViewInventory: false,
      canAccessAllBranches: false,
      // Production Manager permissions
      canAccessInventory: false,
      canRestockProduction: false,
      canRecordDamagedProduction: false,
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
      // Pharmacist permissions
      canCreatePresale: false,
      canLoadPresalesAndFinalize: false,
      canSellWatchlisted: false,
      // Inventory Manager permissions
      canManageMultipleBranches: false,
      canRestock: false,
      canMoveToProduction: false,
      canTransfer: false,
      canReturnProduct: false,
      canRecordDamaged: false,
      // Accountant permissions
      canViewTransactions: false,
      canAccessAllTransactions: false,
      canViewInventory: false,
      canAccessAllBranches: false,
      // Production Manager permissions
      canAccessInventory: false,
      canRestockProduction: false,
      canRecordDamagedProduction: false,
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

    // Include pharmacist permissions if role is PHARMACIST
    if (values.role === "PHARMACIST") {
      payload.canCreatePresale = values.canCreatePresale || false;
      payload.canLoadPresalesAndFinalize =
        values.canLoadPresalesAndFinalize || false;
      payload.canSellWatchlisted = values.canSellWatchlisted || false;
    }

    // Include inventory manager permissions if role is INVENTORY-MANAGER
    if (values.role === "INVENTORY-MANAGER") {
      payload.canManageMultipleBranches =
        values.canManageMultipleBranches || false;
      payload.canRestock = values.canRestock || false;
      payload.canMoveToProduction = values.canMoveToProduction || false;
      payload.canTransfer = values.canTransfer || false;
      payload.canReturnProduct = values.canReturnProduct || false;
      payload.canRecordDamaged = values.canRecordDamaged || false;
    }

    // Include accountant permissions if role is ACCOUNTANT
    if (values.role === "ACCOUNTANT") {
      payload.canViewTransactions = values.canViewTransactions || false;
      payload.canAccessAllTransactions =
        values.canAccessAllTransactions || false;
      payload.canViewInventory = values.canViewInventory || false;
      payload.canAccessAllBranches = values.canAccessAllBranches || false;
    }

    // Include production manager permissions if role is PRODUCTION-MANAGER
    if (values.role === "PRODUCTION-MANAGER") {
      payload.canAccessInventory = values.canAccessInventory || false;
      payload.canRestockProduction = values.canRestockProduction || false;
      payload.canRecordDamagedProduction =
        values.canRecordDamagedProduction || false;
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
      description:
        "Front-line staff member responsible for completing sales and managing customer transactions",
      permissions: [
        "Finalize transaction",
        "See orders and manage order transactions",
        "See transactions",
      ],
      restrictions: [],
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      hasCustomPermissions: false,
    },
    "ADMIN-ATTENDANT": {
      name: "Admin Attendant",
      description:
        "Senior attendant with extended privileges for managing special sales and watchlisted items",
      permissions: [
        "Make pre-sale",
        "Sell watch listed items",
        "See transactions",
        "Finalize transaction",
      ],
      restrictions: [],
      color: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600",
      hasCustomPermissions: false,
    },
    PHARMACIST: {
      name: "Pharmacist",
      description:
        "Licensed pharmacy professional with full system access and inventory management",
      permissions: [
        "Load inventory",
        "See all transactions and performance",
        "Full system access",
      ],
      restrictions: [],
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600",
      hasCustomPermissions: true,
    },
    ACCOUNTANT: {
      name: "Accountant",
      description:
        "Financial oversight role with comprehensive transaction visibility across all branches",
      permissions: [
        "View transactions",
        "Access all transactions",
        "Inventory visibility",
        "Access all branches",
      ],
      restrictions: [
        "Cannot restock products",
        "Cannot transfer inventory",
        "Cannot process returns/damaged/production items",
      ],
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      hasCustomPermissions: true,
    },
    "INVENTORY-MANAGER": {
      name: "Inventory Manager",
      description:
        "Comprehensive inventory control across multiple locations with full product lifecycle management",
      permissions: [
        "Manage inventory across multiple branches",
        "Restock products",
        "Move items to production",
        "Transfer to other locations",
        "Process product returns",
        "Record damaged products",
      ],
      restrictions: [
        "Cannot view transactions",
        "Cannot access orders",
        "Cannot access POS",
        "Cannot view transaction reports",
      ],
      color: "bg-lime-50 border-lime-200",
      iconColor: "text-lime-600",
      hasCustomPermissions: true,
    },
    "PRODUCTION-MANAGER": {
      name: "Production Manager",
      description:
        "Specialized role focused on production inventory and quality control",
      permissions: [
        "Access inventory",
        "Restock products only",
        "Record damaged products",
      ],
      restrictions: [
        "Cannot transfer products to other branches",
        "Cannot process returns",
      ],
      color: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600",
      hasCustomPermissions: true,
    },
  };

  useEffect(() => {
    if (attendantData && attendantId && !AttendantLoading) {
      editform.reset({
        firstname: attendantData?.data?.firstname,
        lastname: attendantData?.data?.lastname,
        phone: attendantData?.data?.phone || "",
        role: attendantData?.data?.role || undefined,
        // Pharmacist permissions
        canCreatePresale: attendantData?.data?.canCreatePresale || false,
        canLoadPresalesAndFinalize:
          attendantData?.data?.canLoadPresalesAndFinalize || false,
        canSellWatchlisted: attendantData?.data?.canSellWatchlisted || false,
        // Inventory Manager permissions
        canManageMultipleBranches:
          attendantData?.data?.canManageMultipleBranches || false,
        canRestock: attendantData?.data?.canRestock || false,
        canMoveToProduction: attendantData?.data?.canMoveToProduction || false,
        canTransfer: attendantData?.data?.canTransfer || false,
        canReturnProduct: attendantData?.data?.canReturnProduct || false,
        canRecordDamaged: attendantData?.data?.canRecordDamaged || false,
        // Accountant permissions
        canViewTransactions: attendantData?.data?.canViewTransactions || false,
        canAccessAllTransactions:
          attendantData?.data?.canAccessAllTransactions || false,
        canViewInventory: attendantData?.data?.canViewInventory || false,
        canAccessAllBranches:
          attendantData?.data?.canAccessAllBranches || false,
        // Production Manager permissions
        canAccessInventory: attendantData?.data?.canAccessInventory || false,
        canRestockProduction:
          attendantData?.data?.canRestockProduction || false,
        canRecordDamagedProduction:
          attendantData?.data?.canRecordDamagedProduction || false,
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

    // Include pharmacist permissions if role is PHARMACIST
    if (values.role === "PHARMACIST") {
      payload.canCreatePresale = values.canCreatePresale || false;
      payload.canLoadPresalesAndFinalize =
        values.canLoadPresalesAndFinalize || false;
      payload.canSellWatchlisted = values.canSellWatchlisted || false;
    }

    // Include inventory manager permissions if role is INVENTORY-MANAGER
    if (values.role === "INVENTORY-MANAGER") {
      payload.canManageMultipleBranches =
        values.canManageMultipleBranches || false;
      payload.canRestock = values.canRestock || false;
      payload.canMoveToProduction = values.canMoveToProduction || false;
      payload.canTransfer = values.canTransfer || false;
      payload.canReturnProduct = values.canReturnProduct || false;
      payload.canRecordDamaged = values.canRecordDamaged || false;
    }

    // Include accountant permissions if role is ACCOUNTANT
    if (values.role === "ACCOUNTANT") {
      payload.canViewTransactions = values.canViewTransactions || false;
      payload.canAccessAllTransactions =
        values.canAccessAllTransactions || false;
      payload.canViewInventory = values.canViewInventory || false;
      payload.canAccessAllBranches = values.canAccessAllBranches || false;
    }

    // Include production manager permissions if role is PRODUCTION-MANAGER
    if (values.role === "PRODUCTION-MANAGER") {
      payload.canAccessInventory = values.canAccessInventory || false;
      payload.canRestockProduction = values.canRestockProduction || false;
      payload.canRecordDamagedProduction =
        values.canRecordDamagedProduction || false;
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
