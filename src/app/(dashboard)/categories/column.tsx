import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

export interface CategoryRow {
  id: string;
  name: string;
  type: string;
}

interface GetColumnsProps {
  onEdit: (category: CategoryRow) => void;
  onDelete: (category: CategoryRow) => void;
}

export const getCategoriesColumns = ({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<CategoryRow>[] => [
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-info-2 text-info-1">
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category)}
            title="Edit category"
            className="rounded-lg p-1.5 cursor-pointer text-primary-green-300 hover:bg-secondary-6 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            title="Delete category"
            className="rounded-lg p-1.5 cursor-pointer text-error-1 hover:bg-error-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];
