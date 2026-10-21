"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { getServicesUrl } from "@/utils/storeUrl";
import { Check, Copy, ExternalLink, Globe, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// navigator.clipboard is undefined outside secure contexts (e.g. testing on a
// LAN IP over http), so fall back to the legacy copy command there.
const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("Copy failed");
};

const BookingLinkCard = () => {
  const { showToast } = useToast();
  const businessId = useBusinessStore((state) => state.business_id);
  const { data: businessResponse, isLoading } =
    useFetchBusinessById(businessId, { enabled: Boolean(businessId) });
  const business = businessResponse?.data;
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  if (!businessId) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-grey-5 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-grey-5" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40 bg-grey-5" />
          <Skeleton className="h-3 w-64 bg-grey-5" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg bg-grey-5 sm:w-72" />
      </div>
    );
  }

  const usesCustomDomain = Boolean(
    business?.custom_domain_approved && business?.custom_domain?.trim(),
  );
  const domainPending = Boolean(
    business?.custom_domain?.trim() && !business?.custom_domain_approved,
  );
  const servicesUrl = getServicesUrl({
    storeSlug: business?.store_url,
    customDomain: business?.custom_domain,
    customDomainApproved: business?.custom_domain_approved,
  });

  // No slug and no approved domain: there is no public page to share yet.
  if (!servicesUrl) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-grey-5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grey-6 text-grey-3">
            <Link2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-grey-1">
              Booking link unavailable
            </p>
            <p className="mt-0.5 text-xs text-grey-3">
              Set up your store URL to get a link customers can book from.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/store-info">Set up store</Link>
        </Button>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await copyText(servicesUrl);
      setCopied(true);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn't copy the link. Select it and copy manually.", "error");
    }
  };

  const displayUrl = servicesUrl.replace(/^https:\/\//, "");

  return (
    <section
      aria-label="Booking link"
      className="flex flex-col gap-4 rounded-2xl border border-grey-5 bg-white p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-2 text-success-1">
          {usesCustomDomain ? (
            <Globe className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-extrabold text-grey-1">
              Your booking link
            </p>
            {usesCustomDomain && (
              <span className="rounded-full bg-success-2 px-2 py-0.5 text-[10px] font-bold text-success-1">
                Custom domain
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-grey-3">
            {domainPending
              ? "Your custom domain is pending approval, so this link uses your Sync360 address for now."
              : "Share it with customers so they can book your services online."}
          </p>
        </div>
      </div>

      <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto">
        <a
          href={servicesUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={servicesUrl}
          className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-grey-5 bg-grey-6 px-3 text-xs font-semibold text-grey-2 transition-colors hover:border-grey-4 lg:w-80 lg:flex-none"
        >
          <span className="truncate">{displayUrl}</span>
          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-grey-4" />
        </a>
        <Button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className={cn(
            "h-10 shrink-0",
            copied &&
              "bg-success-1 text-white hover:bg-success-1",
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy link
            </>
          )}
        </Button>
      </div>
    </section>
  );
};

export default BookingLinkCard;
