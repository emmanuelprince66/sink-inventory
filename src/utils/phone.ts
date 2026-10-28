import { parsePhoneNumber } from "react-phone-number-input";

/**
 * PhoneInput only accepts E.164 values ("+2348031234567"). Older businesses
 * saved local formats ("0803 123 4567"), so convert those (assuming Nigeria)
 * before handing them to the input. Unparseable values come back as "" so the
 * field starts empty instead of throwing.
 */
export const toE164Phone = (value?: string | null): string => {
  const raw = value?.trim();
  if (!raw) return "";
  try {
    return parsePhoneNumber(raw, "NG")?.number ?? "";
  } catch {
    return "";
  }
};

export const PHONE_FORMAT_HINT =
  "Enter the phone number with its country code, e.g. +234 803 123 4567.";

/** Turns backend business-save errors into something a merchant can act on. */
export const friendlyBusinessError = (error: any, fallback: string): string => {
  const message: string =
    error?.details?.message || error?.error || error?.message || "";
  if (/phone number .*international format/i.test(message)) {
    return `Your phone number isn't in the right format. ${PHONE_FORMAT_HINT}`;
  }
  return message || fallback;
};
