"use client";

import { Spinner } from "@/components/app/Spinner";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { JoinLoyaltyApi } from "./useJoinLoyalty";

const Field = ({
  label,
  icon,
  optional,
  hint,
  children,
}: {
  label: string;
  icon: string;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
}) => (
  <div>
    <label className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-grey-1">
      <span aria-hidden>{icon}</span>
      {label}
      {optional ? (
        <span className="text-[11px] font-medium text-grey-4">optional</span>
      ) : (
        <span className="text-error-1">*</span>
      )}
    </label>
    <div className="mt-1.5">{children}</div>
    {hint && <p className="mt-1.5 text-[11px] text-grey-3">{hint}</p>}
  </div>
);

// h-11 and text-sm across the board: anything under 16px would make iOS zoom
// the page on focus, which on a scanned-QR landing page is jarring.
const inputClass =
  "w-full h-11 rounded-xl border border-grey-5 bg-white px-3.5 text-sm text-grey-1 placeholder:text-grey-4 focus:outline-none focus:border-primary-green-300";

const JoinForm = ({ join }: { join: JoinLoyaltyApi }) => {
  const { form, setField, error, isPending, submit, campaign } = join;

  return (
    <>
      <div className="my-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-grey-5" />
        <span className="shrink-0 text-[11px] font-medium text-primary-green-300">
          Join in 30 seconds
        </span>
        <span className="h-px flex-1 bg-grey-5" />
      </div>

      <section className="text-center">
        <span className="text-xs font-bold text-primary-green-300">
          🎁 Join Now — It&apos;s Free
        </span>
        <h2 className="mt-2 text-xl font-extrabold text-grey-1 sm:text-2xl">
          Activate Your Loyalty Card
        </h2>
        <p className="mt-1 text-sm text-grey-3">
          Fill in your details below to get started. We&apos;ll create your
          personal loyalty card instantly.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="mt-5 flex flex-col gap-5 rounded-2xl border border-grey-5 bg-white p-4 sm:p-6"
      >
        <Field label="Full Name" icon="👤">
          <input
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="e.g. Chiamaka Obi"
            className={inputClass}
          />
        </Field>

        <Field
          label="Phone Number"
          icon="📱"
          hint="We'll send you loyalty updates and reward notifications via SMS — no spam, ever."
        >
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            inputMode="tel"
            placeholder="e.g. 0801 234 5678"
            className={inputClass}
          />
        </Field>

        <Field
          label="Email Address"
          icon="✉️"
          optional
          hint="We'll send your loyalty card and receipt confirmations here."
        >
          <input
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            type="email"
            placeholder="your@email.com"
            className={inputClass}
          />
        </Field>

        <Field
          label="Date of Birth"
          icon="🎂"
          optional
          hint="🎁 Sharing your birthday lets us surprise you with exclusive birthday offers and special treats — just for you! Completely optional."
        >
          <input
            value={form.birthday}
            onChange={(e) => setField("birthday", e.target.value)}
            type="date"
            className={inputClass}
          />
        </Field>

        <Field
          label="Address"
          icon="📍"
          optional
          hint="Helps us personalise nearby offers and events. Completely optional."
        >
          <input
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="Your city or neighbourhood"
            className={inputClass}
          />
        </Field>

        <p className="rounded-xl bg-primary-green-500 px-3.5 py-3 text-[11px] leading-relaxed text-grey-2">
          By activating, you agree to receive loyalty updates from{" "}
          <span className="font-bold text-primary-green-300">
            {campaign?.business_name ?? "Our Store"}
          </span>{" "}
          via SMS/email. You can opt out at any time.
        </p>

        {error && <p className="text-xs font-medium text-error-1">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-primary-green-300 py-3.5 text-sm font-extrabold text-white transition-colors",
            isPending
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:bg-primary-green-300/90",
          )}
        >
          {isPending ? <Spinner className="h-4 w-4" /> : <span>🎉</span>}
          Activate My Loyalty Card
        </button>
      </form>
    </>
  );
};

export default JoinForm;
