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
              className={cn(
                "overflow-hidden rounded-xl border bg-white transition-colors",
                isOpen ? "border-primary-green-300" : "border-grey-5",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenModule(isOpen ? null : module)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                  isOpen ? "bg-secondary-6" : "hover:bg-grey-6/60",
                )}
              >
                <span className="text-sm font-bold text-grey-1">
                  {moduleLabel(module)}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      allOn
                        ? "bg-success-2 text-success-1"
                        : count
                          ? "bg-warning-2 text-grey-1"
                          : "bg-grey-6 text-grey-3",
                    )}
                  >
                    {allOn ? "All" : count ? `${count} of ${actions.length}` : "None"}
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
                <div className="border-t border-grey-5 px-4 pb-4 pt-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-grey-3">
                      {count} of {actions.length} allowed
                    </p>
                    {actions.length > 1 && (
                      <button
                        type="button"
                        className="cursor-pointer rounded-md px-2 py-1 text-xs font-bold text-primary-green-300 transition-colors hover:bg-secondary-6"
                        onClick={() => setActions(module, allOn ? [] : actions)}
                      >
                        {allOn ? "Clear all" : "Select all"}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {actions.map((action) => {
                      const checked = enabled.includes(action);
                      return (
                        <label
                          key={action}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                            checked
                              ? "border-primary-green-300/40 bg-secondary-6"
                              : "border-grey-5 bg-white hover:bg-grey-6/60",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(next) =>
                              toggleAction(module, action, next === true)
                            }
                          />
                          <span
                            className={cn(
                              "text-sm",
                              checked ? "font-medium text-grey-1" : "text-grey-2",
                            )}
                          >
                            {actionLabel(module, action)}
                          </span>
                        </label>
                      );
                    })}
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
