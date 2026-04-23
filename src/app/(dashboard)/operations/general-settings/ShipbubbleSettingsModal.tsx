"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Package } from "lucide-react";
import { useState } from "react";

const ShipbubbleSettingsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [category, setCategory] = useState("hot-food");
  const [boxSize, setBoxSize] = useState<
    "small" | "medium" | "large"
  >("small");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 bg-white">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Shipbubble Settings
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-5">
          {/* Shipping Category */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              Shipping Category
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Select the category that best describes your products to ensure
              accurate shipping rates.
            </p>
            <label className="text-xs text-slate-600 block mb-1.5">
              Select Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot-food">
                  Hot food, Dry food and supplements
                </SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Package Weight & Size */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              Package Weight And Size
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Enter the average weight of your packages. This will be used if a
              product's weight is not specified.
            </p>
            <label className="text-xs text-slate-600 block mb-1.5">
              Shipping Box Size
            </label>
            <button
              className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-green-200 bg-green-50/50 hover:bg-green-50"
              onClick={() => {
                // Could cycle sizes — just visual
                setBoxSize(
                  boxSize === "small"
                    ? "medium"
                    : boxSize === "medium"
                      ? "large"
                      : "small",
                );
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-green-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-slate-900 capitalize">
                  {boxSize}
                </span>
                <span className="text-xs text-slate-500">
                  {boxSize === "small" &&
                    "(0.5kg, H:2cm, L:25cm, W:35cm )"}
                  {boxSize === "medium" && "(2kg, H:10cm, L:35cm, W:45cm )"}
                  {boxSize === "large" && "(5kg, H:20cm, L:50cm, W:55cm )"}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Choose logistics partner */}
          <button className="w-full flex items-center justify-between gap-3 py-3 border-t border-slate-100 text-left">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900">
                Choose logistics partner
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred logistics partners from Shipbubble's
                network. Your customers will see this logistics companies at
                checkout.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
          <p className="text-xs text-slate-500">
            Click the save button to effect changes.
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipbubbleSettingsModal;
