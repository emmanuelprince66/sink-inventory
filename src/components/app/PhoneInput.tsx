import * as React from "react";

import PhoneInput from "react-phone-number-input";

import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends React.ComponentProps<typeof PhoneInput> {
  className?: string;
}

function PhoneInputStyled({ className, ...props }: PhoneInputProps) {
  return (
    <PhoneInput
      international
      defaultCountry="US"
      className={cn(
        // Base styles matching the Input component
        "flex w-full min-w-0 rounded-xl bg-white px-4 text-base shadow-xs transition-all outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "h-12 border border-grey-5 focus-within:border-primary-green-300 focus-within:outline-none",
        "aria-invalid:border-destructive",

        // PhoneInput specific overrides
        "[&>input]:bg-transparent [&>input]:border-none [&>input]:focus:ring-0 [&>input]:focus:outline-none [&>input]:h-full [&>input]:w-full",
        "[&_.PhoneInputCountry]:mr-3 [&_.PhoneInputCountrySelectArrow]:opacity-70",

        className
      )}
      {...props}
    />
  );
}

export { PhoneInputStyled as PhoneInput };
