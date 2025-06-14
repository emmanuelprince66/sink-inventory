import Link from "next/link";
import type { ReactNode } from "react";

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
}

export function QuickActionCard({
  icon,
  title,
  description,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col p-2  items-center justify-center rounded-lg border-gray-200 bg-card p-4 text-card-foreground shadow-sm transition-all border hover:border-green-300 hover:shadow-md hover:bg-accent/10"
    >
      <div className="mb-2 rounded-full bg-primary/10 p-2 text-primary">
        {icon}
      </div>
      <h3 className="text-[12px] font-medium">{title}</h3>
      <p className="text-[9px] text-muted-foreground text-center mt-1">
        {description}
      </p>
    </Link>
  );
}
