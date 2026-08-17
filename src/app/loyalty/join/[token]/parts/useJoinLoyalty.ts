"use client";

import { useFetchPublicCampaignQuery } from "@/api/loyalty/fetch-public-campaign";
import { useJoinLoyaltyMutation } from "@/api/loyalty/join-loyalty";
import { useCallback, useEffect, useRef, useState } from "react";

export interface JoinFormState {
  fullName: string;
  phone: string;
  email: string;
  birthday: string;
  address: string;
}

const EMPTY_FORM: JoinFormState = {
  fullName: "",
  phone: "",
  email: "",
  birthday: "",
  address: "",
};

/**
 * The public join flow: resolve the campaign behind the scanned token, collect
 * the customer's details, and hand back the loyalty card the join returns.
 */
export const useJoinLoyalty = (token: string) => {
  const [form, setForm] = useState<JoinFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  // Read after mount — window is unavailable during SSR, and reading it during
  // render would desync the first client paint from the server HTML.
  const [canGoBack, setCanGoBack] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const setField = useCallback(
    <K extends keyof JoinFormState>(key: K, value: JoinFormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const { data: campaignRes, isLoading: campaignLoading } =
    useFetchPublicCampaignQuery({ params: { token } });
  const campaign = campaignRes?.data;

  // Streak length is the VISIT condition's threshold. A spend-based programme
  // has no stamp count, so the streak list is simply not drawn for one.
  const visitCondition = campaign?.conditions?.find(
    (condition) => condition.type === "VISIT",
  );
  const streakLength = Number(visitCondition?.threshold ?? 0);

  const { mutate: join, isPending } = useJoinLoyaltyMutation({
    token,
    onSuccess: (response: any) => setJoined(response?.data ?? {}),
  });

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!form.fullName.trim()) return setError("Please enter your full name.");
      if (!form.phone.trim()) return setError("Please enter your phone number.");

      // The API takes first and last name separately; the design asks for one
      // field, so split on the first space and keep the rest as the surname.
      const [first, ...rest] = form.fullName.trim().split(/\s+/);

      join({
        first_name: first,
        last_name: rest.join(" ") || first,
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        birthday: form.birthday || null,
        address: form.address.trim() || undefined,
      });
    },
    [form, join],
  );

  /**
   * Saves the card as a PNG, the same html2canvas-pro path the merchant QR
   * card and the POS receipt use. Deliberately not window.print(): this page
   * is opened on a phone from a QR scan, where a download is what a customer
   * can actually keep.
   */
  const downloadCard = useCallback(async () => {
    const element = cardRef.current;
    if (!element) return;

    setSaving(true);
    try {
      // The QR is inline SVG, so nothing to await, but any future <img> would
      // rasterise blank without this.
      await Promise.all(
        Array.from(element.querySelectorAll("img")).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        imageTimeout: 15000,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `loyalty_card_${joined?.loyalty_code ?? "card"}.png`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }, "image/png");
    } catch {
      // Nothing to recover — the card is still on screen to screenshot.
    } finally {
      setSaving(false);
    }
  }, [joined]);

  return {
    form,
    setField,
    error,
    joined,
    campaign,
    campaignLoading,
    streakLength,
    isPending,
    submit,
    cardRef,
    saving,
    downloadCard,
    canGoBack,
  };
};

export type JoinLoyaltyApi = ReturnType<typeof useJoinLoyalty>;
