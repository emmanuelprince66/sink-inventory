/**
 * Birthdays, with the year optional.
 *
 * A birthday is used here to greet someone and to build the "Birthdays This
 * Month" segment — both of which only need the day and the month. Plenty of
 * customers will happily give those two and not their age, and a single
 * `<input type="date">` forces all three or nothing (and on mobile renders as
 * an empty box with no hint of the expected format).
 *
 * So the value these helpers move around is either a full `YYYY-MM-DD` or a
 * year-less `MM-DD`.
 */

export interface BirthdayParts {
  /** "01".."31", or "" when unset. */
  day: string;
  /** "01".."12", or "" when unset. */
  month: string;
  /** "1998", or "" when the person did not give a year. */
  year: string;
}

export const EMPTY_BIRTHDAY: BirthdayParts = { day: "", month: "", year: "" };

export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

const pad = (value: number | string) => String(value).padStart(2, "0");

/**
 * How many days a month has.
 *
 * With no year, February gets 29: the person may well have been born on a
 * leap day, and there is no year here to rule it out.
 */
export const daysInMonth = (month: string, year: string): number => {
  const monthNumber = Number(month);
  if (!monthNumber) return 31;
  const yearNumber = Number(year);
  if (!yearNumber) return monthNumber === 2 ? 29 : new Date(2000, monthNumber, 0).getDate();
  return new Date(yearNumber, monthNumber, 0).getDate();
};

/**
 * Reads a stored birthday back into parts.
 *
 * Accepts the full date, the year-less `MM-DD`, and the ISO 8601 spelling of
 * the same thing (`--MM-DD`) in case the backend ever answers with it.
 * Anything unrecognised comes back empty rather than half-filled — a date
 * nobody can parse is not one worth guessing at.
 */
export const parseBirthday = (value?: string | null): BirthdayParts => {
  const text = String(value ?? "").trim();
  if (!text) return EMPTY_BIRTHDAY;

  const full = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text);
  if (full) {
    return { year: full[1], month: pad(full[2]), day: pad(full[3]) };
  }

  const yearless = /^-{0,2}(\d{1,2})-(\d{1,2})$/.exec(text);
  if (yearless) {
    return { year: "", month: pad(yearless[1]), day: pad(yearless[2]) };
  }

  return EMPTY_BIRTHDAY;
};

/**
 * Parts back to what gets sent.
 *
 * Empty until both the day and the month are set: half a birthday is no
 * birthday, and sending one would put a row in next month's segment that
 * nobody can act on. The year is genuinely optional and simply drops out of
 * the string when it is missing.
 */
export const formatBirthday = ({ day, month, year }: BirthdayParts): string => {
  if (!day || !month) return "";
  return year ? `${year}-${month}-${day}` : `${month}-${day}`;
};

/** "12 March 1998", or "12 March" without a year. For display only. */
export const birthdayLabel = (value?: string | null): string => {
  const { day, month, year } = parseBirthday(value);
  if (!day || !month) return "";
  const name = MONTHS.find((entry) => entry.value === month)?.label ?? month;
  return `${Number(day)} ${name}${year ? ` ${year}` : ""}`;
};
