"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

const BookingPageHeader = ({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: string;
  trailing?: ReactNode;
}) => {
  const router = useRouter();

  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border-tint pb-5">
      <div className="flex min-w-0 items-start gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-0.5 shrink-0"
          onClick={() => router.push("/bookings")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-grey-1 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-grey-3">{description}</p>
          )}
        </div>
      </div>
      {trailing}
    </header>
  );
};

export default BookingPageHeader;
