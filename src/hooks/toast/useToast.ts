"use client";

import React from "react";
import { toast } from "sonner";

type ToastStatus = "success" | "error" | "warning" | "info" | "default";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?:
    | {
        label: string;
        onClick?: () => void;
      }
    | React.ReactNode;
}

export function useToast() {
  const showToast = (
    title: string,
    status: ToastStatus = "default",
    options?: ToastOptions
  ) => {
    const baseOptions = {
      duration: 5000,
      ...options,
    };

    // Handle the cancel property carefully
    const toastOptions: any = { ...baseOptions };

    if (options?.cancel) {
      if (
        typeof options.cancel === "object" &&
        !React.isValidElement(options.cancel)
      ) {
        toastOptions.cancel = {
          label: (options.cancel as { label: string }).label,
          onClick: (options.cancel as { onClick?: () => void }).onClick,
        };
      } else {
        // It's a ReactNode - pass it directly
        toastOptions.cancel = options.cancel;
      }
    }

    switch (status) {
      case "success":
        toast.success(title, toastOptions);
        break;
      case "error":
        toast.error(title, toastOptions);
        break;
      case "warning":
        toast.warning(title, toastOptions);
        break;
      case "info":
        toast.info(title, toastOptions);
        break;
      default:
        toast(title, toastOptions);
    }
  };

  return { showToast };
}
