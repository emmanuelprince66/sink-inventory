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
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
  const [storeLocation, setStoreLocation] = useState("headquarters");
  const [locationName, setLocationName] = useState("");
  const [phone, setPhone] = useState("");
  const [cantFindAddress, setCantFindAddress] = useState(false);
  const [address, setAddress] = useState("");

  const resetForm = () => {
    setStoreLocation("headquarters");
    setLocationName("");
    setPhone("");
    setCantFindAddress(false);
    setAddress("");
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
            {showForm ? "Dispatch Pick-up Location" : "Pick-up Location"}
          </SheetTitle>
        </SheetHeader>

        {!showForm ? (
          // List view
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
          // Form view
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5 border-t border-slate-100">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Store Location
                </label>
                <Select
                  value={storeLocation}
                  onValueChange={setStoreLocation}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headquarters">Headquarters</SelectItem>
                    <SelectItem value="branch1">Branch 1</SelectItem>
                    <SelectItem value="branch2">Branch 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cantFindAddress}
                  onChange={(e) => setCantFindAddress(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">
                  Couldn't find address?
                </span>
              </label>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Address
                </label>
                <Input
                  placeholder="Start typing an address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 sticky bottom-0 bg-white">
              <Button
                disabled={!phone.trim() || !address.trim()}
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
