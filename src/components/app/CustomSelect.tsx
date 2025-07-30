// components/ui/Select.tsx
import React from "react";
import Select, { ActionMeta, GroupBase, Props } from "react-select";

// types/select.ts
export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

export type SelectValue = SelectOption | null;

interface CustomSelectProps
  extends Props<SelectOption, false, GroupBase<SelectOption>> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

// components/ui/Select.tsx
const CustomSelect = React.forwardRef<any, CustomSelectProps>(
  (
    {
      label,
      error,
      options,
      value,
      onChange,
      isLoading = false,
      isClearable = false,
      isSearchable = true,
      placeholder = "Select...",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const customStyles = {
      control: (base: any) => ({
        ...base,
        minHeight: "42px",
        borderColor: "#d1d5db",
        cursor: "pointer", // Added cursor pointer
        "&:hover": {
          borderColor: "#059669",
        },
        "&:focus-within": {
          borderColor: "#059669",
          boxShadow: "0 0 0 1px #059669",
        },
      }),
      option: (base: any, { isFocused, isSelected }: any) => ({
        ...base,
        cursor: "pointer", // Added cursor pointer
        backgroundColor: isSelected
          ? "#059669" // emerald-600
          : isFocused
          ? "#d1fae5" // emerald-100
          : "white",
        color: isSelected ? "white" : "#1f2937", // gray-800
        ":active": {
          backgroundColor: "#059669",
          color: "white",
        },
      }),
      dropdownIndicator: (base: any) => ({
        ...base,
        color: "#9ca3af", // gray-400
        cursor: "pointer", // Added cursor pointer
        ":hover": {
          color: "#6b7280", // gray-500
        },
      }),
      clearIndicator: (base: any) => ({
        ...base,
        color: "#9ca3af", // gray-400
        cursor: "pointer", // Added cursor pointer
        ":hover": {
          color: "#6b7280", // gray-500
        },
      }),
      menu: (base: any) => ({
        ...base,
        marginTop: "2px", // Reduced space between input and menu
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb", // gray-200
        zIndex: 9999,
      }),
      menuList: (base: any) => ({
        ...base,
        padding: 0,
      }),
    };

    const handleChange = (
      newValue: SelectOption | null,
      actionMeta: ActionMeta<SelectOption>
    ) => {
      if (onChange) {
        onChange(newValue, actionMeta);
      }
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
            {" "}
            {/* Added cursor-pointer */}
            {label}
          </label>
        )}
        <Select
          ref={ref}
          className="react-select-container"
          classNamePrefix="react-select"
          options={options}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          isClearable={isClearable}
          isSearchable={isSearchable}
          isLoading={isLoading}
          loadingMessage={() => "Loading..."}
          noOptionsMessage={() => "No options found"}
          menuPlacement="auto"
          menuPosition="fixed"
          menuShouldScrollIntoView={false}
          styles={customStyles}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
CustomSelect.displayName = "CustomSelect";

export default CustomSelect;
