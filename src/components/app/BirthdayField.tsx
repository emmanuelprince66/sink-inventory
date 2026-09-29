"use client";

import { cn } from "@/lib/utils";
import {
  daysInMonth,
  formatBirthday,
  MONTHS,
  parseBirthday,
} from "@/utils/birthday";
import { ChevronDown } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

/**
 * One select and its chevron. The icon never takes the tap — the select does.
 *
 * Declared here rather than inside BirthdayField: a component defined during
 * render is a new type on every render, so React would tear down and rebuild
 * these selects after each pick — enough to close a phone's picker mid-choice.
 */
const Picker = ({
  label,
  value,
  onSelect,
  className,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  className: string;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <div className="relative">
    <select
      aria-label={label}
      className={className}
      disabled={disabled}
      value={value}
      onChange={(event) => onSelect(event.target.value)}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-3" />
  </div>
);

/**
 * Day / month / year, with the year optional.
 *
 * Three selects rather than `<input type="date">`, for two reasons. On a phone
 * the native date input renders as an empty box — no placeholder, no hint of
 * what it wants — and it insists on all three parts, so a customer willing to
 * give "12 March" but not their age could give nothing at all.
 *
 * Native `<select>` on purpose: phones render these as their own wheel picker,
 * which beats anything rebuilt in a popover, and each one shows its label so
 * the field reads as filled-in or not at a glance.
 */
const BirthdayField = ({
  value,
  onChange,
  className,
  disabled,
  /** Oldest year offered. A century covers every living customer. */
  earliestYear = new Date().getFullYear() - 100,
}: {
  /** "YYYY-MM-DD", or "MM-DD" when the year was left out. */
  value?: string | null;
  onChange: (value: string) => void;
  /** Styling for each select, so the field matches the form around it. */
  className?: string;
  disabled?: boolean;
  earliestYear?: number;
}) => {
  /**
   * The three selections live here, not in the value above.
   *
   * A birthday is only worth sending once it has both a day and a month, so
   * `formatBirthday` answers "" for anything less. Reading the selects back
   * out of that meant the first pick emitted "", came back empty, and the
   * select snapped to its placeholder — the field looked broken until a
   * second pick completed it.
   */
  const [parts, setParts] = useState(() => parseBirthday(value));

  /**
   * Follows the value when it is changed from outside — a form reset, or a
   * customer's saved birthday arriving late.
   *
   * Keyed on what this field last emitted rather than on the value itself: a
   * half-filled field emits "", and treating that echo as an external change
   * would wipe the pick that caused it.
   */
  const lastEmitted = useRef(formatBirthday(parseBirthday(value)));

  useEffect(() => {
    const incoming = value ?? "";
    if (incoming === lastEmitted.current) return;
    lastEmitted.current = incoming;
    setParts(parseBirthday(incoming));
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from({ length: currentYear - earliestYear + 1 }, (_, index) =>
        String(currentYear - index),
      ),
    [currentYear, earliestYear],
  );

  const dayCount = daysInMonth(parts.month, parts.year);
  const days = useMemo(
    () =>
      Array.from({ length: dayCount }, (_, index) =>
        String(index + 1).padStart(2, "0"),
      ),
    [dayCount],
  );

  /**
   * Applies one change, and drops a day the new month cannot have.
   *
   * Picking 31 and then February would otherwise leave an impossible date on
   * screen, which the backend rejects at submit — long after the person moved
   * on from this field.
   */
  const update = (next: Partial<typeof parts>) => {
    const merged = { ...parts, ...next };
    const limit = daysInMonth(merged.month, merged.year);
    if (Number(merged.day) > limit) merged.day = "";

    setParts(merged);

    const emitted = formatBirthday(merged);
    lastEmitted.current = emitted;
    onChange(emitted);
  };

  const selectClass = cn(
    // pr-7 leaves room for the chevron; `appearance-none` takes the platform's
    // own away, and without one back a select reads as a plain text box.
    "w-full appearance-none truncate rounded-xl border border-grey-5 bg-white pl-2.5 pr-7 text-sm text-grey-1 focus:border-primary-green-300 focus:outline-none disabled:opacity-60",
    className,
  );

  return (
    // Month gets the extra width: it is the only one whose longest option is a
    // word, and "September" clips in an even third on a narrow phone.
    <div className="grid grid-cols-[0.8fr_1.35fr_1fr] gap-2">
      <Picker
        className={selectClass}
        disabled={disabled}
        label="Day of birth"
        value={parts.day}
        onSelect={(day) => update({ day })}
      >
        <option value="">Day</option>
        {days.map((day) => (
          <option key={day} value={day}>
            {Number(day)}
          </option>
        ))}
      </Picker>

      <Picker
        className={selectClass}
        disabled={disabled}
        label="Month of birth"
        value={parts.month}
        onSelect={(month) => update({ month })}
      >
        <option value="">Month</option>
        {MONTHS.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </Picker>

      {/* Blank is a real answer here, not an empty state: the label says so,
          and clearing it keeps whatever day and month were already given. */}
      <Picker
        className={selectClass}
        disabled={disabled}
        label="Year of birth (optional)"
        value={parts.year}
        onSelect={(year) => update({ year })}
      >
        <option value="">Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Picker>
    </div>
  );
};

export default BirthdayField;
