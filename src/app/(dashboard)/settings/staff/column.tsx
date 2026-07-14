import { ColumnDef } from "@tanstack/react-table";
import { Building2, Edit2Icon, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StaffRow {
  id: string;
  name: string;
  role: string;
  businesses?: { id: string; name: string }[];
}

const ROLE_STYLES: Record<string, string> = {
  "ADMIN-ATTENDANT": "bg-info-2 text-info-1",
  ATTENDANT: "bg-grey-6 text-grey-3",
  "INVENTORY-MANAGER": "bg-[#f5f3ff] text-[#7c3aed]",
  "PRODUCTION-MANAGER": "bg-warning-2 text-warning-1",
  ACCOUNTANT: "bg-success-2 text-success-1",
  OWNER: "bg-secondary-6 text-primary-green-300",
};
const DEFAULT_ROLE_STYLE = "bg-grey-6 text-grey-3";

interface GetColumnsProps {
  onManageBusinesses: (staff: StaffRow) => void;
  onEdit: (staff: StaffRow) => void;
  onDelete: (staff: StaffRow) => void;
}

export const getStaffColumns = ({
  onManageBusinesses,
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<StaffRow>[] => [
  {
    accessorKey: "name",
    header: "Staff Name",
    cell: ({ row }) => (
      <p className="text-sm font-bold text-grey-2">{row.original.name}</p>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase",
            ROLE_STYLES[role] ?? DEFAULT_ROLE_STYLE,
          )}
        >
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "businesses",
    header: "Businesses",
    cell: ({ row }) => {
      const businesses = row.original.businesses;
      return (
        <p className="text-sm text-grey-3">
          {businesses && businesses.length > 0
            ? businesses.map((b) => b.name).join(", ")
            : "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "",
    header: "Action",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex gap-1 items-center">
          <button
            onClick={() => onManageBusinesses(staff)}
            title="Manage Businesses"
            className="rounded-lg p-1.5 cursor-pointer text-info-1 hover:bg-info-2 transition-colors"
          >
            <Building2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(staff)}
            title="Edit Staff"
            className="rounded-lg p-1.5 cursor-pointer text-primary-green-300 hover:bg-secondary-6 transition-colors"
          >
            <Edit2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(staff)}
            title="Delete Staff"
            className="rounded-lg p-1.5 cursor-pointer text-error-1 hover:bg-error-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];
