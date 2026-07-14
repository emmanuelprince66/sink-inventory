import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";

export interface DepartmentRow {
  id: string;
  name: string;
}

export const getDepartmentColumns = (): ColumnDef<DepartmentRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <p className="text-sm font-bold text-grey-1 capitalize">
        {row.original.name}
      </p>
    ),
  },
  {
    accessorKey: "",
    header: "Actions",
    cell: () => (
      <div className="flex items-center gap-1">
        <button
          title="Edit department"
          disabled
          className="rounded-lg p-1.5 text-grey-4 cursor-not-allowed"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          title="Delete department"
          disabled
          className="rounded-lg p-1.5 text-grey-4 cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
