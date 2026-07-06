import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface InitialsAvatarProps {
  /** Full name to derive initials from. Ignored when `initials` is passed. */
  name?: string;
  /** Explicit initials override, for sources that already supply their own (e.g. a partner's short code). */
  initials?: string;
  tone?: "dark" | "green" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TONE_STYLES: Record<string, string> = {
  dark: "bg-primary-green-100",
  green: "bg-primary-green-300",
  info: "bg-info-1",
};

const SIZE_STYLES: Record<string, string> = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

/** Colored initials circle used for delivery partners, riders, and other people/entities without a photo. */
export function InitialsAvatar({
  name,
  initials,
  tone = "green",
  size = "sm",
  className,
}: InitialsAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-extrabold text-white shrink-0",
        TONE_STYLES[tone],
        SIZE_STYLES[size],
        className,
      )}
    >
      {initials ?? (name ? getInitials(name) : "")}
    </div>
  );
}
