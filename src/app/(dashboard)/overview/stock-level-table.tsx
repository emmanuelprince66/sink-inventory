import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockItem {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  status: string;
}

interface StockLevelTableProps {
  items: StockItem[];
}

export function StockLevelTable({ items }: StockLevelTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="hidden md:table-cell">SKU</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.sku}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="hidden md:table-cell">{item.sku}</TableCell>
              <TableCell className="hidden md:table-cell">
                {item.category}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status.includes("Out of Stock")
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : item.status.includes("Low Stock")
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      : item.status.includes("Expiring")
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
