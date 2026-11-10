"use client";

import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/useCan";
import { homePathFor } from "@/utils/pageAccess";
import { ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";

/** Where the page guard sends someone whose permissions don't cover a page. */
export default function UnauthorizedPage() {
  const router = useRouter();
  const { role, matrix } = useCan();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7F4] px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-grey-5 bg-white px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error-2 text-error-1">
          <ShieldOff className="h-7 w-7" />
        </span>
        <h1 className="text-lg font-extrabold text-grey-1">
          You don&apos;t have access to this page
        </h1>
        <p className="text-sm text-grey-3">
          Your permissions don&apos;t include it. Ask the business owner if you
          need it.
        </p>
        <Button
          className="mt-2 bg-primary-green-300 text-white"
          onClick={() => router.push(homePathFor(role, matrix, "/pos"))}
        >
          Go to my dashboard
        </Button>
      </div>
    </div>
  );
}
