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

// Permission schema matching backend structure
const permissionsSchema = z.object({
  manage_inventory_across_branches: z.boolean().optional(),
  restock_products: z.boolean().optional(),
  move_items_to_production: z.boolean().optional(),
  transfer_items: z.boolean().optional(),
  return_items: z.boolean().optional(),
  damage_items: z.boolean().optional(),
  process_sales: z.boolean().optional(),
  apply_discounts: z.boolean().optional(),
  view_orders: z.boolean().optional(),
  manage_suppliers: z.boolean().optional(),
  manage_bank_details: z.boolean().optional(),
  sell_watchlist: z.boolean().optional(),
  dispense_drugs: z.boolean().optional(),
  view_prescriptions: z.boolean().optional(),
  make_presale: z.boolean().optional(),
  view_transactions: z.boolean().optional(),
});

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
  set_permissions: permissionsSchema.optional(),
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
  set_permissions: permissionsSchema.optional(),
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
      set_permissions: {
        manage_inventory_across_branches: false,
        restock_products: false,
        move_items_to_production: false,
        transfer_items: false,
        return_items: false,
        damage_items: false,
        process_sales: false,
        apply_discounts: false,
        view_orders: false,
        manage_suppliers: false,
        manage_bank_details: false,
        sell_watchlist: false,
        dispense_drugs: false,
        view_prescriptions: false,
        make_presale: false,
        view_transactions: false,
      },
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
      set_permissions: {
        manage_inventory_across_branches: false,
        restock_products: false,
        move_items_to_production: false,
        transfer_items: false,
        return_items: false,
        damage_items: false,
        process_sales: false,
        apply_discounts: false,
        view_orders: false,
        manage_suppliers: false,
        manage_bank_details: false,
        sell_watchlist: false,
        dispense_drugs: false,
        view_prescriptions: false,
        make_presale: false,
        view_transactions: false,
      },
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

    // Add permissions if they exist
    if (values.set_permissions) {
      payload.set_permissions = values.set_permissions;
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
        "Licensed pharmacy professional with special permissions for prescriptions and sales",
      permissions: [
        "Process sales (load presales and complete sales)",
        "Make pre-sale",
        "Sell watchlisted items",
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
        "View orders and history",
        "Inventory visibility",
        "Access all branches",
      ],
      restrictions: [
        "Cannot restock products",
        "Cannot transfer inventory",
        "Cannot process returns/damaged/production items",
        "Cannot do anything under inventory (view only)",
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
        "See products that can't be seen at POS",
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
        "View orders and history (see who sold what)",
      ],
      restrictions: [
        "Cannot sell at point of sales",
        "Cannot view payments",
        "Cannot transfer products to other branches",
        "Cannot process returns",
        "Cannot see products with checklist at POS",
      ],
      color: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600",
      hasCustomPermissions: true,
    },
  };

  useEffect(() => {
    if (attendantData && attendantId && !AttendantLoading) {
      const permissions = attendantData?.data?.set_permissions || {};

      editform.reset({
        firstname: attendantData?.data?.firstname,
        lastname: attendantData?.data?.lastname,
        phone: attendantData?.data?.phone || "",
        role: attendantData?.data?.role || undefined,
        set_permissions: {
          manage_inventory_across_branches:
            permissions.manage_inventory_across_branches || false,
          restock_products: permissions.restock_products || false,
          move_items_to_production:
            permissions.move_items_to_production || false,
          transfer_items: permissions.transfer_items || false,
          return_items: permissions.return_items || false,
          damage_items: permissions.damage_items || false,
          process_sales: permissions.process_sales || false,
          apply_discounts: permissions.apply_discounts || false,
          view_orders: permissions.view_orders || false,
          manage_suppliers: permissions.manage_suppliers || false,
          manage_bank_details: permissions.manage_bank_details || false,
          sell_watchlist: permissions.sell_watchlist || false,
          dispense_drugs: permissions.dispense_drugs || false,
          view_prescriptions: permissions.view_prescriptions || false,
          make_presale: permissions.make_presale || false,
          view_transactions: permissions.view_transactions || false,
        },
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

    // Add permissions if they exist
    if (values.set_permissions) {
      payload.set_permissions = values.set_permissions;
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
    // Computed values and helpers for clean UI
    selectedRole: form.watch("role") || editform.watch("role"),
    permissions:
      form.watch("set_permissions") || editform.watch("set_permissions") || {},
    roleConfig: (() => {
      const role = form.watch("role") || editform.watch("role");
      return role
        ? ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
        : null;
    })(),
    getSelectedPermissionsCount: () => {
      const perms =
        form.watch("set_permissions") || editform.watch("set_permissions");
      if (!perms) return 0;
      return Object.values(perms).filter(Boolean).length;
    },
  };
};
