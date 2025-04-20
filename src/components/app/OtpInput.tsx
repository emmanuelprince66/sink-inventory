// components/app/OtpInput.tsx
"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OtpInput({ value = "", onChange, length = 6 }: OtpInputProps) {
  const inputs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (value.length === length) {
      inputs.current[length - 1]?.blur();
    }
  }, [value, length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = e.target.value;
    if (newValue.match(/^[0-9]*$/)) {
      const newOtp = value.padEnd(length, " ").split(""); // Ensure we have enough characters
      newOtp[index] = newValue.slice(-1);
      onChange(newOtp.join("").trim());

      // Auto focus next input
      if (newValue && index < length - 1) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            if (el) inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-12 text-center text-xl"
        />
      ))}
    </div>
  );
}
