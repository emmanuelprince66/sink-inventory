"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Lock, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

/**
 * The small building blocks the KYC screens share — the panel every tier form
 * sits in, the coloured notices, and the section headings inside a long form.
 * Keeping them here is what stops each tier from inventing its own card.
 */

interface TierPanelProps {
  tier: number;
  title: string;
  description: string;
  /** Right-hand side of the header, e.g. the limit this tier unlocks. */
  aside?: ReactNode;
  children: ReactNode;
}

export const TierPanel = ({
  tier,
  title,
  description,
  aside,
  children,
}: TierPanelProps) => (
  <section className="rounded-2xl border border-border-tint bg-white p-5 shadow-xs sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-grey-6 pb-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-6 text-primary-green-300">
          <ShieldCheck size={20} />
        </span>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-primary-green-300">
            Tier {tier}
          </p>
          <h2 className="text-lg font-bold text-grey-1">{title}</h2>
          <p className="mt-0.5 text-sm text-grey-3">{description}</p>
        </div>
      </div>
      {aside}
    </header>

    <div className="pt-5">{children}</div>
  </section>
);

/** The limit chip that sits in a TierPanel header. */
export const LimitChip = ({ limit }: { limit: string }) => (
  <span className="rounded-full bg-secondary-6 px-3 py-1.5 text-xs font-bold text-primary-green-100">
    Unlocks {limit} daily
  </span>
);

const NOTICE_TONES = {
  info: {
    wrap: "border-info-2 bg-info-2/30",
    icon: "text-info-1",
    title: "text-info-1",
    body: "text-grey-2",
    Icon: Info,
  },
  warning: {
    wrap: "border-warning-2 bg-warning-2/40",
    icon: "text-warning-1",
    title: "text-warning-1",
    body: "text-grey-2",
    Icon: AlertTriangle,
  },
  success: {
    wrap: "border-secondary-3 bg-secondary-6/60",
    icon: "text-primary-green-300",
    title: "text-primary-green-100",
    body: "text-grey-2",
    Icon: ShieldCheck,
  },
  locked: {
    wrap: "border-grey-5 bg-grey-6/50",
    icon: "text-grey-3",
    title: "text-grey-2",
    body: "text-grey-3",
    Icon: Lock,
  },
} as const;

interface NoticeProps {
  tone?: keyof typeof NOTICE_TONES;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Notice = ({
  tone = "info",
  title,
  children,
  className,
}: NoticeProps) => {
  const style = NOTICE_TONES[tone];
  const { Icon } = style;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        style.wrap,
        className,
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", style.icon)} />
      <div className="text-sm">
        {title && (
          <p className={cn("mb-0.5 font-bold", style.title)}>{title}</p>
        )}
        <div className={style.body}>{children}</div>
      </div>
    </div>
  );
};

interface SectionHeadingProps {
  title: string;
  description?: string;
  /** e.g. "2 of 4 uploaded" */
  meta?: string;
}

export const SectionHeading = ({
  title,
  description,
  meta,
}: SectionHeadingProps) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2">
    <div>
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-grey-2">
        {title}
      </h3>
      {description && <p className="mt-1 text-sm text-grey-3">{description}</p>}
    </div>
    {meta && (
      <span className="text-xs font-bold text-primary-green-300">{meta}</span>
    )}
  </div>
);

/** Read-only recap of what the earlier tiers already captured. */
export const CapturedSummary = ({
  items,
}: {
  items: { label: string; value: string }[];
}) => (
  <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl border border-secondary-3 bg-secondary-6/50 p-4">
    {items.map((item) => (
      <div key={item.label}>
        <p className="text-[11px] font-bold uppercase tracking-wide text-grey-3">
          {item.label}
        </p>
        <p className="text-sm font-semibold text-grey-1">{item.value}</p>
      </div>
    ))}
  </div>
);

/** Masks an identity number down to its last four digits. */
export const maskId = (value?: string) =>
  value && value.length >= 4 ? `•••• ${value.slice(-4)}` : "—";
