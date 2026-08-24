"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, FlaskConical } from "lucide-react";

/**
 * ⚠️ DEMO ONLY — REMOVE BEFORE RELEASE.
 *
 * Marks the current tier complete and moves to the next one without running
 * any validation or touching the API, so the screens can be walked through
 * end-to-end while the KYC endpoint is still being built.
 *
 * To strip it out: delete this file and the two <DemoSkipButton /> usages in
 * IndividualAcct.tsx and CorporateAcct.tsx. Nothing else references it.
 */
const DemoSkipButton = ({
  label,
  onSkip,
}: {
  label: string;
  onSkip: () => void;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-warning-1/50 bg-warning-2/30 px-4 py-3">
    <p className="flex items-center gap-2 text-xs font-semibold text-warning-1">
      <FlaskConical size={14} />
      Demo shortcut — skips validation. Remove before release.
    </p>
    <Button type="button" size="sm" variant="outline" onClick={onSkip}>
      {label}
      <ArrowRight size={14} />
    </Button>
  </div>
);

export default DemoSkipButton;
