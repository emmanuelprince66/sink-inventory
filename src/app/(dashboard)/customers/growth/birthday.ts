import type { CustomerSegment, UserCustomer } from "@/types/segment";
import { parseBirthday } from "@/utils/birthday";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_MS = 24 * 60 * 60 * 1000;

export const isBirthdaySegment = (segment?: CustomerSegment | null) =>
  segment?.segment_type === "BIRTHDAY";

/**
 * "YYYY-MM-DD" → [month (0-11), day]. Split by hand rather than `new Date()`,
 * which reads a bare date as UTC and can slip a day west of Greenwich.
 *
 * `parseBirthday` also accepts the year-less "MM-DD" a customer leaves when
 * they give a birthday but not their age. Everything below only ever wanted
 * the month and the day, so those birthdays count here like any other.
 */
const monthDay = (ymd?: string | null): [number, number] | null => {
  const { month, day } = parseBirthday(ymd);
  if (!month || !day) return null;
  return [Number(month) - 1, Number(day)];
};

/**
 * A customer's birthday, from whichever form the endpoint sent.
 *
 * `birth_month` / `birth_day` are the backend's own split and are taken as
 * given; the string is the fallback for the endpoints that only send that one.
 */
const customerMonthDay = (customer: UserCustomer): [number, number] | null => {
  const { birth_month: month, birth_day: day } = customer;
  if (month && day) return [month - 1, day];
  return monthDay(customer.date_of_birth ?? customer.birthday);
};

/** "Sep 21" for a customer, year or no year. Null when no birthday is on file. */
export const customerMonthDayLabel = (customer: UserCustomer) => {
  const md = customerMonthDay(customer);
  return md ? `${MONTHS[md[0]]} ${md[1]}` : null;
};

const isLeap = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** "2026-09-21" → "Sep 21". Year dropped: the day is what matters here. */
export const formatMonthDay = (ymd?: string | null) => {
  const md = monthDay(ymd);
  return md ? `${MONTHS[md[0]]} ${md[1]}` : null;
};

/**
 * Days from today to the next occurrence of the birthday, 0 on the day.
 * A 29 Feb birthday falls on 28 Feb in non-leap years.
 */
const countDaysFrom = (
  md: [number, number] | null,
  today = new Date(),
) => {
  if (!md) return null;
  const [month, day] = md;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const occurrence = (year: number) =>
    new Date(year, month, month === 1 && day === 29 && !isLeap(year) ? 28 : day);

  let next = occurrence(start.getFullYear());
  if (next < start) next = occurrence(start.getFullYear() + 1);
  return Math.round((next.getTime() - start.getTime()) / DAY_MS);
};

/**
 * The backend's count when sent — under either of its two names — otherwise
 * one worked out here from the birthday itself.
 */
export const daysToBirthday = (customer: UserCustomer) => {
  const sent = customer.days_until_birthday ?? customer.days_to_birthday;
  return typeof sent === "number"
    ? sent
    : countDaysFrom(customerMonthDay(customer));
};

export const countdownLabel = (days: number | null) => {
  if (days === null) return "Date unknown";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

/** Pill colour by urgency: today, this week, later. */
export const countdownTone = (days: number | null) => {
  if (days === null) return "bg-grey-6 text-grey-3";
  if (days === 0) return "bg-pink-500 text-white";
  if (days <= 7) return "bg-pink-100 text-pink-700";
  return "bg-grey-6 text-grey-2";
};

/**
 * The window label: the backend's own when sent, else built from the dates.
 * Returns null when neither is available.
 */
export const windowLabel = (segment: CustomerSegment) => {
  if (segment.birthday_window) return segment.birthday_window.replace(" - ", " – ");
  const from = formatMonthDay(segment.window_start_date);
  const to = formatMonthDay(segment.window_end_date);
  return from && to ? `${from} – ${to}` : null;
};

export const windowDays = (segment: CustomerSegment) => {
  const days = Number(segment.conditions?.birthday_window_days);
  return Number.isFinite(days) && days > 0 ? days : null;
};

/**
 * Pre-filled campaign text. Kept under the campaign form's 150-character
 * limit and left editable — it's a starting point for the merchant.
 */
export const birthdayOfferMessage = (name?: string) => {
  const first = name?.trim().split(/\s+/)[0];
  return `Happy birthday${first ? `, ${first}` : ""}! 🎉 Here's a special birthday treat from us. Show this message on your next visit to claim it.`;
};
