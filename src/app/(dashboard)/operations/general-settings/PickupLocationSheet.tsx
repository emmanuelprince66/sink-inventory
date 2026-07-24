"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { City, State } from "country-state-city";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

interface PickupLocation {
  id: string;
  name: string;
  phone: string;
  address: string;
}

const PickupLocationSheet = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [locations] = useState<PickupLocation[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [locationName, setLocationName] = useState("");
  const [phone, setPhone] = useState("");
  const [stateIso, setStateIso] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [customCityMode, setCustomCityMode] = useState(false);

  // Deliveries/pickups are domestic (Nigeria) — same convention as the
  // Shipbubble Configure form (ShipbubbleSettingsModal.tsx) right next to
  // this sheet: canonical state/city names so an address validator
  // downstream doesn't reject freeform spelling.
  const NG_STATES = useMemo(() => State.getStatesOfCountry("NG"), []);
  const cityOptions = useMemo(
    () => (stateIso ? City.getCitiesOfState("NG", stateIso) : []),
    [stateIso],
  );
  const useCustomCityInput = customCityMode || (!!stateIso && cityOptions.length === 0);

  const handleStateChange = (iso: string) => {
    setStateIso(iso);
    setCity("");
    setCustomCityMode(false);
  };

  const resetForm = () => {
    setLocationName("");
    setPhone("");
    setStateIso("");
    setCity("");
    setAddress("");
    setCustomCityMode(false);
  };

  const handleBack = () => {
    if (showForm) {
      setShowForm(false);
      resetForm();
    } else {
      onClose();
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setShowForm(false);
          resetForm();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] bg-white p-0 overflow-hidden flex flex-col"
      >
        <SheetHeader className="p-5 border-b border-slate-100 space-y-0">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </button>
          <SheetTitle className="text-2xl font-bold text-slate-900">
            {showForm ? "Pickup Location" : "Pickup Locations"}
          </SheetTitle>
        </SheetHeader>

        {!showForm ? (
          <>
            <div className="p-5">
              <Button
                onClick={() => setShowForm(true)}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Add
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {locations.length === 0 ? (
                <div className="bg-slate-50 rounded-xl py-12 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 mb-3 flex items-center justify-center">
                    <Image
                      src="/empty-box.svg"
                      alt="Empty"
                      width={80}
                      height={80}
                      className="opacity-70"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Pickup List is Empty
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="border border-slate-200 rounded-lg p-3"
                    >
                      <p className="font-medium text-sm">{loc.name}</p>
                      <p className="text-xs text-slate-500">{loc.phone}</p>
                      <p className="text-xs text-slate-500">{loc.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5 border-t border-slate-100">
              <div>
                <label className="text-sm text-slate-600 block mb-1.5">
                  Location Name (Optional)
                </label>
                <Input
                  placeholder="Enter Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-slate-600 block mb-1.5">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Select value={stateIso} onValueChange={handleStateChange}>
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
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Town <span className="text-red-500">*</span>
                  </label>
                  {useCustomCityInput ? (
                    <div className="space-y-1.5">
                      <Input
                        placeholder={stateIso ? "Enter your town" : "Pick a state first"}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={!stateIso}
                      />
                      {cityOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomCityMode(false);
                            setCity("");
                          }}
                          className="text-[11px] text-green-700 hover:text-green-800 font-semibold"
                        >
                          Back to town list
                        </button>
                      )}
                    </div>
                  ) : (
                    <Select
                      value={city}
                      onValueChange={(v) => {
                        if (v === "__other__") {
                          setCustomCityMode(true);
                          setCity("");
                        } else {
                          setCity(v);
                        }
                      }}
                      disabled={!stateIso}
                    >
                      <SelectTrigger className="bg-white w-full">
                        <SelectValue
                          placeholder={stateIso ? "Pick a town" : "Pick a state first"}
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
                          className="text-green-700 font-semibold"
                        >
                          Other (type your own)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. 14 Allen Avenue"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 sticky bottom-0 bg-white">
              <Button
                disabled={!phone.trim() || !stateIso || !city.trim() || !address.trim()}
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Save Location
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PickupLocationSheet;
