"use client";

import { SearchInput } from "@/components/app/SearchInput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Country, ICountry, State } from "country-state-city";
import { ArrowLeft, Check, ChevronDown, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";

// Searchable country picker — a plain <Select> with ~250 countries is
// unusable without search. Built from the app's existing Popover +
// SearchInput primitives rather than pulling in a new combobox dependency.
const CountryPicker = ({
  countries,
  value,
  onChange,
}: {
  countries: ICountry[];
  value: string;
  onChange: (isoCode: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = countries.find((c) => c.isoCode === value);
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full bg-white z-100 flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm cursor-pointer"
        >
          <span className={selected ? "text-slate-900" : "text-slate-400"}>
            {selected
              ? `${selected.flag} ${selected.name}`
              : "Select a country e.g. Nigeria"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width]  border border-gray-200 p-2 space-y-2 bg-white z-100"
      >
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search countries..."
          className="h-9"
          autoFocus
        />
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No country matches "{search}"
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.isoCode}
                type="button"
                onClick={() => {
                  onChange(c.isoCode);
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm text-left hover:bg-slate-100 cursor-pointer"
              >
                <span>
                  {c.flag} {c.name}
                </span>
                {c.isoCode === value && (
                  <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ShippingLocationSheet = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [allWorldwide, setAllWorldwide] = useState(true);
  const [specificExpanded, setSpecificExpanded] = useState(false);
  const [shipByDistance, setShipByDistance] = useState(false);

  // Specific-locations form state — country, then the states served within it.
  const [countryIso, setCountryIso] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const statesOfCountry = useMemo(
    () => (countryIso ? State.getStatesOfCountry(countryIso) : []),
    [countryIso],
  );
  const availableStatesToAdd = statesOfCountry.filter(
    (s) => !selectedStates.includes(s.name),
  );

  const handleCountryChange = (iso: string) => {
    setCountryIso(iso);
    setSelectedStates([]);
  };

  const handleAddState = (stateName: string) => {
    setSelectedStates((prev) => [...prev, stateName]);
  };

  const handleRemoveState = (stateName: string) => {
    setSelectedStates((prev) => prev.filter((s) => s !== stateName));
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[520px] bg-white p-0 overflow-y-auto"
      >
        <SheetHeader className="p-5 space-y-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </button>
          <SheetTitle className="text-2xl font-bold text-slate-900">
            Shipping Location
          </SheetTitle>
          <p className="text-sm text-slate-500 mt-1">
            Manage the locations you'd like to ship to. You can only use one
          </p>
        </SheetHeader>

        <div className="px-5 pb-5">
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {/* All locations worldwide */}
            <div className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  All locations worldwide
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  This means you can deliver to anywhere in the world
                </p>
              </div>
              <Switch
                checked={allWorldwide}
                onCheckedChange={(checked) => {
                  setAllWorldwide(checked);
                  if (checked) {
                    setSpecificExpanded(false);
                    setShipByDistance(false);
                  }
                }}
              />
            </div>

            {/* Specific locations */}
            <div className="py-4">
              <button
                onClick={() => {
                  setSpecificExpanded((prev) => !prev);
                  if (!specificExpanded) setAllWorldwide(false);
                }}
                className="w-full flex items-start justify-between gap-4 text-left"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Specific locations
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Ship to specific locations
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    specificExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {specificExpanded && (
                <div className="mt-3 pl-1 space-y-4">
                  <p className="text-xs text-slate-500">
                    Pick a country, then add the states you serve within it.
                  </p>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Country
                    </label>
                    <CountryPicker
                      countries={countries}
                      value={countryIso}
                      onChange={handleCountryChange}
                    />
                  </div>

                  {countryIso && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        States you serve
                      </label>

                      {statesOfCountry.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No state-level data for this country — it'll be
                          treated as fully served once added.
                        </p>
                      ) : (
                        <>
                          <Select
                            value=""
                            onValueChange={handleAddState}
                            disabled={availableStatesToAdd.length === 0}
                          >
                            <SelectTrigger className="bg-white w-full">
                              <SelectValue
                                placeholder={
                                  availableStatesToAdd.length === 0
                                    ? "All states added"
                                    : "Add a state"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStatesToAdd.map((s) => (
                                <SelectItem key={s.isoCode} value={s.name}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedStates.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {selectedStates.map((stateName) => (
                                <span
                                  key={stateName}
                                  className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-green-50 border border-green-200 text-sm font-semibold text-green-800"
                                >
                                  {stateName}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveState(stateName)}
                                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-green-200 cursor-pointer"
                                    aria-label={`Remove ${stateName}`}
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Distance based */}
            <div className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  Ship based on distance from your store location
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Set the maximum time in hours that the customer's location
                  should be away from your store.
                </p>
              </div>
              <Switch
                checked={shipByDistance}
                onCheckedChange={(checked) => {
                  setShipByDistance(checked);
                  if (checked) setAllWorldwide(false);
                }}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShippingLocationSheet;
