// components/ui/modal.tsx
import { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactNode;
  /**
   * Optional content rendered below the title (e.g. small caption / steps).
   * Renders only when provided.
   */
  headerExtras?: ReactNode;
  /**
   * Optional icon shown next to the title (e.g. a branded square).
   */
  headerIcon?: ReactNode;
  /**
   * Optional footer that stays pinned to the bottom of the dialog while the
   * body scrolls. Use for primary action rows (Save / Cancel).
   */
  footer?: ReactNode;
  /**
   * Max width preset. Defaults to "md" (600px) to match the previous behaviour.
   */
  size?: ModalSize;
  /**
   * Extra classes for the content container (rarely needed).
   */
  className?: string;
}

const SIZE_MAX_WIDTH: Record<ModalSize, string> = {
  sm: "sm:max-w-[425px]",
  md: "md:max-w-[600px]",
  lg: "md:max-w-[720px]",
  xl: "md:max-w-[860px]",
  "2xl": "md:max-w-[960px]",
};

export function CustomModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  trigger,
  headerExtras,
  headerIcon,
  footer,
  size = "md",
  className,
}: ModalProps) {
  const isPinnedLayout = Boolean(footer);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {trigger && (
        <DialogTrigger asChild>
          <div className="cursor-pointer">{trigger}</div>
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          // Base sizing — width caps step up at sm/md.
          "w-full max-w-[90vw] sm:max-w-[425px]",
          SIZE_MAX_WIDTH[size],
          // When there's a sticky footer we want the body to scroll but the
          // footer to stay pinned, so make the dialog a flex column with no
          // padding here (the header / body / footer manage their own).
          isPinnedLayout
            ? "max-h-[92vh] p-0 flex flex-col overflow-hidden"
            : "max-h-[90vh] md:max-h-[95vh] overflow-y-auto p-6",
          "bg-white z-50 border-0 rounded-lg",
          className,
        )}
      >
        <DialogHeader
          className={cn(
            isPinnedLayout && "px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100",
          )}
        >
          <div className="flex items-start gap-3">
            {headerIcon && (
              <div className="shrink-0 mt-0.5">{headerIcon}</div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-gray-600 sm:text-base mt-1">
                  {description}
                </DialogDescription>
              )}
              {headerExtras}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div
          className={cn(
            "w-full",
            isPinnedLayout
              ? "flex-1 overflow-y-auto px-4 sm:px-6 py-4"
              : "mt-4",
          )}
        >
          {children}
        </div>

        {/* Sticky footer (only when provided) */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-white">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
