"use client";

import { useUpdateBusinessMutation } from "@/api/business/create-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Globe2,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const DNS_TARGET = "store.sync360.africa";

const normalizeDomain = (input: string) => {
  const value = input.trim();
  if (!value) return "";

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (
      url.username ||
      url.password ||
      url.port ||
      (url.pathname !== "/" && url.pathname !== "") ||
      url.search ||
      url.hash
    ) {
      return "";
    }

    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    const labels = hostname.split(".");
    const validLabels = labels.every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
    );

    return labels.length >= 2 &&
      hostname.length <= 253 &&
      validLabels &&
      !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
      ? hostname
      : "";
  } catch {
    return "";
  }
};

interface CustomDomainSetupProps {
  businessId?: string | null;
  customDomain?: string | null;
  isApproved?: boolean;
}

export default function CustomDomainSetup({
  businessId,
  customDomain,
  isApproved = false,
}: CustomDomainSetupProps) {
  const storedBusinessId = useBusinessStore((state) => state.business_id);
  const [step, setStep] = useState<1 | 2>(1);
  const [domainInput, setDomainInput] = useState(customDomain || "");
  const [savedDomain, setSavedDomain] = useState(customDomain || "");
  const [approved, setApproved] = useState(isApproved);
  const [isChangingDomain, setIsChangingDomain] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDomainInput(customDomain || "");
    setSavedDomain(customDomain || "");
    setApproved(isApproved);
    setStep(1);
    setIsChangingDomain(false);
  }, [customDomain, isApproved]);

  const { mutate: updateBusiness, isPending } = useUpdateBusinessMutation({
    onSuccess: (response) => {
      const updatedBusiness = response?.data;
      setSavedDomain(updatedBusiness?.custom_domain || normalizedDomain);
      setApproved(Boolean(updatedBusiness?.custom_domain_approved));
      setDomainInput(updatedBusiness?.custom_domain || normalizedDomain);
      setStep(1);
      setIsChangingDomain(false);
    },
  });

  const normalizedDomain = normalizeDomain(domainInput);
  const verifiedDomain = normalizeDomain(savedDomain);

  const continueToDns = () => {
    if (!normalizedDomain) {
      setValidationMessage(
        "Enter a valid domain name, such as shop.yourbusiness.com.",
      );
      return;
    }
    setDomainInput(normalizedDomain);
    setValidationMessage("");
    setStep(2);
  };

  const saveDomain = () => {
    const id = businessId || storedBusinessId;
    if (!id || !normalizedDomain) {
      setValidationMessage(
        "We couldn't validate your domain. Please go back and check it.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("business_id", id);
    formData.append("custom_domain", normalizedDomain);
    updateBusiness(formData);
  };

  const copyTarget = async () => {
    try {
      await navigator.clipboard.writeText(DNS_TARGET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy the CNAME target:", error);
      setValidationMessage(
        "Couldn't copy the CNAME target. Please copy it manually.",
      );
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border-tint bg-white">
      <div className="border-b border-border-tint p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-6 text-primary-green-300">
            <Globe2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-extrabold text-grey-1">
              Connect a custom domain
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-grey-3">
              Let customers visit your online store using your own web address.
            </p>
          </div>
        </div>
      </div>

      {savedDomain && step === 1 && !isChangingDomain ? (
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-xl border border-grey-5 bg-grey-6 p-4">
            {approved ? (
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-1" />
            ) : (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-warning-1" />
            )}
            <div className="min-w-0">
              <p className="break-all text-sm font-bold text-grey-1">
                {savedDomain}
              </p>
              <p className="mt-1 text-xs text-grey-3">
                {approved
                  ? "Your domain is verified and ready to use. Open it to test your storefront."
                  : "Your domain is currently under verification. We'll update its status here once the checks are complete."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {approved && verifiedDomain && (
              <Button asChild className="w-full sm:w-auto">
                <a
                  href={`https://${verifiedDomain}/in`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="text-sm font-medium text-green-600 transition hover:text-green-700">
                    Test custom domain
                  </p>
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setDomainInput(savedDomain);
                setValidationMessage("");
                setIsChangingDomain(true);
              }}
            >
              Edit domain
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <div
            className="mb-5 flex items-center gap-3"
            aria-label={`Step ${step} of 2`}
          >
            {[1, 2].map((item) => (
              <div key={item} className="flex flex-1 items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    step >= item
                      ? "bg-primary-green-300 text-white"
                      : "bg-grey-6 text-grey-3",
                  )}
                >
                  {step > item ? <Check className="h-4 w-4" /> : item}
                </span>
                <span className="text-xs font-semibold text-grey-3">
                  {item === 1 ? "Your domain" : "DNS setup"}
                </span>
                {item === 1 && <span className="h-px flex-1 bg-grey-5" />}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="custom-domain"
                  className="mb-2 block text-sm font-bold text-grey-2"
                >
                  Enter your domain
                </label>
                <Input
                  id="custom-domain"
                  value={domainInput}
                  onChange={(event) => {
                    setDomainInput(event.target.value);
                    setValidationMessage("");
                  }}
                  placeholder="shop.yourbusiness.com"
                  autoComplete="url"
                  disabled={isPending}
                />
                <p className="mt-2 text-xs leading-relaxed text-grey-3">
                  Enter the web address you want customers to use. We recommend
                  a subdomain such as <strong>shop.yourbusiness.com</strong>.
                </p>
              </div>
              {validationMessage && (
                <p role="alert" className="text-sm text-error-1">
                  {validationMessage}
                </p>
              )}
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={continueToDns}
                disabled={!domainInput.trim() || isPending}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {savedDomain && isChangingDomain && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:ml-2 sm:w-auto"
                  onClick={() => {
                    setDomainInput(savedDomain);
                    setValidationMessage("");
                    setIsChangingDomain(false);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-extrabold text-grey-1">
                  Add this CNAME record to your domain provider
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-grey-3">
                  Sign in to the service where you manage{" "}
                  <strong className="break-all text-grey-2">
                    {normalizedDomain}
                  </strong>
                  , open its DNS settings, and add the record below. DNS changes
                  may take some time to become available.
                </p>
              </div>

              <div className="grid gap-3 rounded-xl border border-grey-5 bg-grey-6 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-grey-3">
                    Record type
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-grey-1">
                    CNAME
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-grey-3">
                    Name / Host
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-bold text-grey-1">
                    {normalizedDomain}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-grey-3">
                    Points to / Target
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="min-w-0 break-all font-mono text-sm font-bold text-grey-1">
                      {DNS_TARGET}
                    </p>
                    <button
                      type="button"
                      onClick={copyTarget}
                      aria-label="Copy CNAME target"
                      className="shrink-0 rounded-md p-1.5 text-grey-3 transition hover:bg-white hover:text-primary-green-300"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-info-2 p-3 text-xs leading-relaxed text-info-1">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  DNS provider labels vary. Use <strong>CNAME</strong> as the
                  record type, your chosen domain as the host, and{" "}
                  <strong>{DNS_TARGET}</strong> as the target. If your provider
                  automatically appends your domain to the host field, enter
                  only the subdomain part. If it doesn&apos;t allow a CNAME for
                  this host, contact your domain provider for help setting up a
                  CNAME or alias.
                </p>
              </div>

              {validationMessage && (
                <p role="alert" className="text-sm text-error-1">
                  {validationMessage}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={saveDomain}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving domain...
                    </>
                  ) : (
                    "I've added the record — save domain"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
