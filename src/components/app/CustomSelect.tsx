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
        borderColor: "#d1d5db", // grey-5
        borderRadius: "12px",
        cursor: "pointer",
        "&:hover": {
          borderColor: "#329661", // primary-green-300
        },
        "&:focus-within": {
          borderColor: "#329661",
          boxShadow: "0 0 0 1px #329661",
        },
      }),
      option: (base: any, { isFocused, isSelected }: any) => ({
        ...base,
        cursor: "pointer",
        borderRadius: "8px",
        fontWeight: isSelected ? 700 : 500,
        backgroundColor: isSelected
          ? "#329661" // primary-green-300
          : isFocused
          ? "#eef7e0" // secondary-6
          : "white",
        color: isSelected ? "white" : "#374151", // grey-2
        ":active": {
          backgroundColor: "#329661",
          color: "white",
        },
      }),
      dropdownIndicator: (base: any) => ({
        ...base,
        color: "#9ca3af", // grey-4
        cursor: "pointer",
        ":hover": {
          color: "#6b7280", // grey-3
        },
      }),
      clearIndicator: (base: any) => ({
        ...base,
        color: "#9ca3af", // grey-4
        cursor: "pointer",
        ":hover": {
          color: "#6b7280", // grey-3
        },
      }),
      menu: (base: any) => ({
        ...base,
        marginTop: "2px",
        boxShadow: "0 4px 12px 0 rgba(27, 50, 40, 0.08)",
        border: "1px solid #d1d5db", // grey-5
        borderRadius: "12px",
        overflow: "hidden",
        zIndex: 9999,
      }),
      menuList: (base: any) => ({
        ...base,
        padding: "6px",
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
          <label className="block text-sm font-bold text-grey-2 mb-1 cursor-pointer">
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
        {error && <p className="mt-1 text-sm font-medium text-error-1">{error}</p>}
      </div>
    );
  }
);
CustomSelect.displayName = "CustomSelect";

export default CustomSelect;
