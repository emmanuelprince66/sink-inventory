"use client";

import React from "react";
import { isPosOfflineNow } from "@/lib/offline/offlineMode";
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

/**
 * The browser's own wording when a request can't leave the device
 * (Chrome/Edge, Firefox, Safari). Many screens toast `error.message` as-is,
 * which turns into a bare "Failed to fetch".
 */
const BROWSER_NETWORK_ERROR = /^(failed to fetch|networkerror when attempting to fetch resource\.?|load failed|fetch failed)$/i;

export function useToast() {
  const showToast = (
    title: string,
    status: ToastStatus = "default",
    options?: ToastOptions
  ) => {
    if (status === "error" && BROWSER_NETWORK_ERROR.test(String(title).trim())) {
      // Offline, the POS already says so in its banner, and every list that
      // can't load would otherwise stack its own toast.
      if (isPosOfflineNow()) return;
      title = "Couldn't reach the server. Check your internet connection.";
    }

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
