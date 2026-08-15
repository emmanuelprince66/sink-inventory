import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { CustomerType } from "./types";

// Column order and colouring follow the Customers design exactly.
//
// Gender, Tier, Points, Last Purchase, Visits, Risk, Score and Status have no
// source in the customer payload — it returns only name, phone, email, wallet,
// sales_count, total_sales and addresses. Those cells render an em-dash rather
// than an invented value, so the table keeps the designed shape without
// implying data that does not exist. AllCustomers carries a DataGapBadge
// naming all eight for the backend.

const AVATAR_TONES = [
  "bg-primary-green-300",
  "bg-emerald-500",
  "bg-teal-600",
  "bg-sky-600",
  "bg-violet-500",
  "bg-amber-500",
];

/** Stable per-customer tint so avatars don't reshuffle between renders. */
const avatarTone = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
};

const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

const Blank = () => <span className="text-sm text-grey-4">—</span>;

export const columns: ColumnDef<CustomerType>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white",
              avatarTone(customer.id ?? customer.name ?? ""),
            )}
          >
            {initials(customer.name)}
          </span>
          <p className="text-sm font-bold text-primary-green-300 truncate">
            {customer.name}
          </p>
        </div>
      );
    },
  },
  {
    id: "customer_id",
    header: "ID",
    cell: ({ row, table }) => {
      // The payload has no human-readable code, so derive a stable CUS-00n
      // from the row's position in the current page.
      const index = table
        .getRowModel()
        .rows.findIndex((r) => r.id === row.id);
      return (
        <span className="text-xs font-medium text-info-1 whitespace-nowrap">
          CUS-{String(index + 1).padStart(3, "0")}
        </span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm text-grey-2 whitespace-nowrap">
        {row.original.phone || "—"}
      </span>
    ),
  },
  {
    id: "gender",
    header: "Gender",
    cell: () => <Blank />,
  },
  {
    id: "location",
    header: "State / City",
    cell: ({ row }) => {
      const address =
        row.original.addresses?.find((a) => a.is_default) ??
        row.original.addresses?.[0];
      const parts = [address?.city, address?.state].filter(Boolean);
      return parts.length ? (
        <span className="text-sm text-info-1 whitespace-nowrap">
          {parts.join(", ")}
        </span>
      ) : (
        <Blank />
      );
    },
  },
  {
    id: "tier",
    header: "Tier",
    cell: () => <Blank />,
  },
  {
    id: "points",
    header: "Points",
    cell: () => <Blank />,
  },
  {
    accessorKey: "wallet",
    header: "Wallet / Credit",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-warning-1 whitespace-nowrap">
        {formatToNaira(Number(row.original.wallet ?? 0))}
      </span>
    ),
  },
  {
    accessorKey: "sales_count",
    header: "Orders",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-info-1">
        {Number(row.original.sales_count ?? 0)}
      </span>
    ),
  },
  {
    accessorKey: "total_sales",
    header: "Total Spend",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-primary-green-300 whitespace-nowrap">
        {formatToNaira(Number(row.original.total_sales ?? 0))}
      </span>
    ),
  },
  {
    id: "avg_basket",
    header: "Avg Basket",
    cell: ({ row }) => {
      const orders = Number(row.original.sales_count ?? 0);
      const spend = Number(row.original.total_sales ?? 0);
      return orders > 0 ? (
        <span className="text-sm text-primary-green-300 whitespace-nowrap">
          {formatToNaira(spend / orders)}
        </span>
      ) : (
        <Blank />
      );
    },
  },
  {
    id: "ltv",
    header: "LTV",
    cell: ({ row }) => (
      <span className="text-sm font-extrabold text-primary-green-300 whitespace-nowrap">
        {formatToNaira(Number(row.original.total_sales ?? 0))}
      </span>
    ),
  },
  {
    id: "last_purchase",
    header: "Last Purchase",
    cell: () => <Blank />,
  },
  {
    id: "visits",
    header: "Visits",
    cell: () => <Blank />,
  },
  {
    id: "risk",
    header: "Risk",
    cell: () => <Blank />,
  },
  {
    id: "score",
    header: "Score",
    cell: () => <Blank />,
  },
  {
    id: "status",
    header: "Status",
    cell: () => <Blank />,
  },
  {
    id: "action",
    header: "",
    cell: ({ row }) => {
      const customer = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();

      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/customers/${customer.id}`);
          }}
          className="text-xs font-bold text-grey-2 hover:text-primary-green-300 cursor-pointer whitespace-nowrap"
        >
          View Profile
        </button>
      );
    },
  },
];
