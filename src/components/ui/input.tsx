import * as React from "react";

import { FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

function Input({
  className,
  type,
  icon,
  showPasswordToggle = false,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="relative w-full">
      <input
        type={isPasswordField && showPassword ? "text" : type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-grey-4 selection:bg-primary-green-300 selection:text-white",
          "flex w-full min-w-0 rounded-md bg-white border border-grey-5 px-4 text-base shadow-xs transition-all outline-none",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "h-12 focus:border-primary-green-300 focus:outline-none focus:ring-2 focus:ring-primary-green-300/20",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          icon || (isPasswordField && showPasswordToggle) ? "pr-10" : "",
          className
        )}
        {...props}
      />

      {/* Icon */}
      {icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-4 pointer-events-none">
          {icon}
        </div>
      )}

      {/* Password toggle */}
      {isPasswordField && showPasswordToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-4 hover:text-grey-2 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {!showPassword ? (
            <FaRegEyeSlash className="h-5 w-5" />
          ) : (
            <IoEyeOutline className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}

export { Input };
