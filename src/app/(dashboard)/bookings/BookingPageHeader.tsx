"use client";

import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

// Mirrors ViewOrder's header: a plain bordered back button + title, no
// subtitle copy.
const BookingPageHeader = ({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) => {
  const router = useRouter();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/bookings")}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-grey-5 px-3 py-2 text-sm font-bold text-grey-2 transition-colors hover:border-grey-4 hover:bg-grey-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="truncate text-xl font-extrabold text-grey-1">{title}</h1>
      </div>
      {trailing}
    </header>
  );
};

export default BookingPageHeader;
