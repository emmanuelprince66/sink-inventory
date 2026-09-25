"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ReactNode } from "react";

/**
 * A collapsible card for one transaction flow.
 *
 * Wallet transactions and pending BNPL settlements are two separate ledgers
 * that happen to share a page, and each carries a table of its own. Collapsing
 * one is what makes the other readable without scrolling past it.
 *
 * Only the title row is the trigger. Filters, search and links live inside the
 * content, where a click cannot also fold the section away — the usual trap
 * with an accordion header that has controls in it.
 */
const CollapsibleSection = ({
  value,
  icon,
  title,
  subtitle,
  summary,
  defaultOpen = true,
  children,
}: {
  /** Item id within this section's own accordion. Only has to be unique here. */
  value: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Shown on the right of the trigger, so a collapsed section still says
   *  something — a count, a total. */
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) => (
  <Accordion
    type="single"
    collapsible
    defaultValue={defaultOpen ? value : undefined}
    className="overflow-hidden rounded-2xl border border-grey-5 bg-white"
  >
    <AccordionItem value={value} className="border-b-0">
      <AccordionTrigger className="gap-3 rounded-none px-4 py-4 hover:no-underline sm:px-5 [&>svg]:mt-1 [&>svg]:text-grey-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-2 text-info-1">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="font-bold text-grey-1">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs font-normal text-grey-3">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {summary && <div className="shrink-0 pr-2 text-right">{summary}</div>}
      </AccordionTrigger>

      {/* The primitive animates height, so the padding goes on an inner box —
          padding on the content itself is included in the collapsed height and
          leaves a gap under a closed section. */}
      <AccordionContent>
        <div className="border-t border-grey-5">{children}</div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default CollapsibleSection;
