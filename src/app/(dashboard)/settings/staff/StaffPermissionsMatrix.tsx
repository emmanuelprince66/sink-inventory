"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  actionLabel,
  moduleLabel,
  PermissionsMatrix,
} from "@/utils/permissionsMatrix";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

/** One row per module; open a row to tick individual actions. */
const StaffPermissionsMatrix = ({
  role,
  modules,
  value,
  onChange,
  onReset,
  isCustom,
  canReset,
  isLoading,
  isError,
  onRetry,
}: {
  role?: string;
  modules: PermissionsMatrix | null;
  value: PermissionsMatrix | null;
  onChange: (next: PermissionsMatrix) => void;
  onReset: () => void;
  isCustom: boolean;
  canReset: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) => {
  const [openModule, setOpenModule] = useState<string | null>(null);

  if (!role) return null;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg bg-grey-5" />
        ))}
      </div>
    );
  }

  if (isError || !modules || !value) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-error-1/30 bg-error-2 p-4">
        <p className="text-sm text-error-1">
          Couldn&apos;t load the permissions for this role.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  const setActions = (module: string, actions: string[]) =>
    onChange({ ...value, [module]: actions });

  const toggleAction = (module: string, action: string, on: boolean) => {
    const current = value[module] ?? [];
    setActions(
      module,
      on ? [...current, action] : current.filter((item) => item !== action),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Permissions
          </h3>
          <p className="mt-1 text-xs text-grey-3">
            {isCustom
              ? "Customised for this person."
              : "Using this role's standard permissions."}
          </p>
        </div>
        {isCustom && canReset && (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            Reset to Role Defaults
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {Object.entries(modules).map(([module, actions]) => {
          const enabled = value[module] ?? [];
          const count = actions.filter((a) => enabled.includes(a)).length;
          const isOpen = openModule === module;
          const allOn = count === actions.length;

          return (
            <div
              key={module}
              className="overflow-hidden rounded-lg border border-grey-5"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenModule(isOpen ? null : module)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left hover:bg-grey-6/60"
              >
                <span className="text-sm font-bold text-grey-1">
                  {moduleLabel(module)}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      count
                        ? "bg-success-2 text-success-1"
                        : "bg-grey-6 text-grey-3",
                    )}
                  >
                    {count} of {actions.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-grey-4 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </span>
              </button>

              {isOpen && (
                <div className="space-y-2 border-t border-grey-6 p-3">
                  {actions.length > 1 && (
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-bold text-primary-green-300 underline"
                      onClick={() => setActions(module, allOn ? [] : actions)}
                    >
                      {allOn ? "Turn all off" : "Turn all on"}
                    </button>
                  )}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {actions.map((action) => (
                      <label
                        key={action}
                        className="flex cursor-pointer items-start gap-2"
                      >
                        <Checkbox
                          className="mt-0.5"
                          checked={enabled.includes(action)}
                          onCheckedChange={(checked) =>
                            toggleAction(module, action, checked === true)
                          }
                        />
                        <span className="text-sm text-grey-2">
                          {actionLabel(module, action)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffPermissionsMatrix;
