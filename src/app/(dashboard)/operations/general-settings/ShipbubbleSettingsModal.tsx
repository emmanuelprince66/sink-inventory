"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { PhoneInput } from "@/components/app/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useShipbubbleHook } from "@/hooks/useShipbubbleHook";
import { City, State } from "country-state-city";
import {
  ChevronRight,
  Landmark,
  Layers,
  MapPin,
  Package,
  Pencil,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BoxSizePickerModal from "./BoxSizePickerModal";

interface ShipbubbleSettingsModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional callback fired after a successful save (e.g. to flip a parent toggle). */
  onSaved?: () => void;
}

const ShipbubbleSettingsModal = ({
  open,
  onClose,
  onSaved,
}: ShipbubbleSettingsModalProps) => {
  const {
    boxSizes,
    boxSizesLoading,
    categories,
    categoriesLoading,
    settings,
    companies,
    updateSetting,
    save,
    validateSettings,
    isSaving,
    resetFromBusiness,
  } = useShipbubbleHook();
  const { showToast } = useToast();

  const [openBoxPicker, setOpenBoxPicker] = useState(false);

  // Shipbubble operates in Nigeria only — country is locked. State + city use
  // canonical names from country-state-city so the backend's address validator
  // (geocoder) doesn't reject the address.
  const NG_STATES = useMemo(() => State.getStatesOfCountry("NG"), []);
  const selectedStateIso = useMemo(
    () => NG_STATES.find((s) => s.name === settings.state)?.isoCode || "",
    [NG_STATES, settings.state],
  );
  const cityOptions = useMemo(
    () =>
      selectedStateIso ? City.getCitiesOfState("NG", selectedStateIso) : [],
    [selectedStateIso],
  );
  // True when the saved city isn't in the dropdown list — drop into free-text
  // mode automatically so the merchant can see/edit their saved value.
  const cityIsCustom =
    settings.city.length > 0 &&
    cityOptions.length > 0 &&
    !cityOptions.some((c) => c.name === settings.city);
  const [customCityMode, setCustomCityMode] = useState(false);
  const useCustomCityInput =
    customCityMode ||
    cityIsCustom ||
    (selectedStateIso && cityOptions.length === 0);

  const handleStateChange = (iso: string) => {
    const name = NG_STATES.find((s) => s.isoCode === iso)?.name || "";
    updateSetting("state", name);
    updateSetting("city", "");
    setCustomCityMode(false);
  };

  // Re-hydrate from the live business object every time the modal re-opens.
  useEffect(() => {
    if (open) {
      resetFromBusiness();
      setCustomCityMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSave = () => {
    const err = validateSettings();
    if (err) {
      showToast(err, "error");
      return;
    }
    // Saving the Shipbubble Configure form is, by definition, enabling and
    // activating Shipbubble — always include it in shipping_companies AND
    // flip is_active on, so the AutomatedShipping toggle reflects "on"
    // immediately once this save succeeds, without a separate manual toggle.
    const nextCompanies = Array.from(
      new Set([...companies, "SHIPBUBBLE" as const]),
    );
    save(
      { shippingCompanies: nextCompanies, settingsPatch: { isActive: true } },
      {
        onSuccess: () => {
          onSaved?.();
          onClose();
        },
      },
    );
  };

  return (
    <>
      <CustomModal
        isOpen={open}
        onClose={onClose}
        title="Shipbubble Settings"
        description="Tell Shipbubble where to collect parcels and what a default shipment looks like."
        size="lg"
        headerIcon={
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <SettingsIcon className="w-4 h-4" />
          </div>
        }
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              Changes apply to new shipments only.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 flex-1 sm:flex-none"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step 1 — Pickup Address */}
          <SettingsTile
            step={1}
            icon={<MapPin className="w-4 h-4" />}
            title="Pickup Address"
            description="Where Shipbubble riders should collect every shipment."
          >
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Street">
                <Input
                  value={settings.street}
                  onChange={(e) => updateSetting("street", e.target.value)}
                  placeholder="e.g. 14 Allen Avenue"
                />
              </Field>
              <Field label="State">
                <Select
                  value={selectedStateIso}
                  onValueChange={handleStateChange}
                >
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="Pick a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NG_STATES.map((s) => (
                      <SelectItem key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="City">
                {useCustomCityInput ? (
                  <div className="space-y-1.5">
                    <Input
                      value={settings.city}
                      onChange={(e) => updateSetting("city", e.target.value)}
                      placeholder={
                        selectedStateIso
                          ? "Enter your city"
                          : "Pick a state first"
                      }
                      disabled={!selectedStateIso}
                    />
                    {cityOptions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCityMode(false);
                          updateSetting("city", "");
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        Back to city list
                      </button>
                    )}
                  </div>
                ) : (
                  <Select
                    value={settings.city}
                    onValueChange={(v) => {
                      if (v === "__other__") {
                        setCustomCityMode(true);
                        updateSetting("city", "");
                      } else {
                        updateSetting("city", v);
                      }
                    }}
                    disabled={!selectedStateIso}
                  >
                    <SelectTrigger className="bg-white w-full">
                      <SelectValue
                        placeholder={
                          selectedStateIso
                            ? "Pick a city"
                            : "Pick a state first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                      <SelectItem
                        value="__other__"
                        className="text-emerald-700 font-semibold"
                      >
                        Other (type your own)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <Field label="Phone">
                <PhoneInput
                  value={settings.phone || undefined}
                  onChange={(value) => updateSetting("phone", value || "")}
                  defaultCountry="NG"
                  placeholder="Phone number"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Landmark">
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <Input
                      value={settings.landmark}
                      onChange={(e) =>
                        updateSetting("landmark", e.target.value)
                      }
                      placeholder="e.g. Behind Shoprite"
                      className="pl-9"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </SettingsTile>

          {/* Step 2 — Shipping Category */}
          <SettingsTile
            step={2}
            icon={<Layers className="w-4 h-4" />}
            title="Shipping Category"
            description="Helps Shipbubble pick carriers and rate cards that match your products."
          >
            {categoriesLoading ? (
              <Skeleton className="mt-3 h-10 w-full bg-slate-100" />
            ) : (
              <Select
                value={
                  settings.category ? String(settings.category.category_id) : ""
                }
                onValueChange={(v) => {
                  const picked = categories.find(
                    (c) => String(c.category_id) === v,
                  );
                  if (picked) updateSetting("category", picked);
                }}
              >
                <SelectTrigger className="mt-3 bg-white w-full">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem
                      key={c.category_id}
                      value={String(c.category_id)}
                    >
                      {c.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SettingsTile>

          {/* Step 3 — Default Package Size */}
          <SettingsTile
            step={3}
            icon={<Package className="w-4 h-4" />}
            title="Default Package Size"
            description="Used when a product hasn't set its own dimensions. Tap to pick from the Shipbubble catalogue."
          >
            <button
              type="button"
              onClick={() => setOpenBoxPicker(true)}
              className="mt-3 w-full flex items-center gap-3 sm:gap-4 p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-white border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
                {settings.packageSize?.description_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.packageSize.description_image_url}
                    alt={settings.packageSize.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {settings.packageSize?.name || "Pick a box size"}
                </p>
                {settings.packageSize ? (
                  <>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Max Weight: {settings.packageSize.max_weight} Kg
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      H:{settings.packageSize.height}cm · L:
                      {settings.packageSize.length}cm · W:
                      {settings.packageSize.width}cm
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Envelope, Flyer, Small Box, etc.
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
            </button>
          </SettingsTile>
        </div>
      </CustomModal>

      <BoxSizePickerModal
        isOpen={openBoxPicker}
        onClose={() => setOpenBoxPicker(false)}
        value={settings.packageSize}
        onChange={(size) => updateSetting("packageSize", size)}
        options={boxSizes}
        loading={boxSizesLoading}
      />
    </>
  );
};

// ─── Layout helpers ─────────────────────────────────────────────────────────

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
      {label}
    </Label>
    {children}
  </div>
);

interface SettingsTileProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}
const SettingsTile = ({
  step,
  icon,
  title,
  description,
  children,
}: SettingsTileProps) => (
  <div className="relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
    <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-slate-200" />
    <div className="pl-4 pr-3 sm:pl-5 sm:pr-4 py-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg flex flex-col items-center justify-center border bg-slate-50 border-slate-200 text-slate-600">
          <span className="text-[8px] font-semibold uppercase tracking-wider opacity-80">
            Step
          </span>
          <span className="text-[10px] font-bold leading-none">
            {String(step).padStart(2, "0")}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-slate-500 mt-0.5">{icon}</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default ShipbubbleSettingsModal;
