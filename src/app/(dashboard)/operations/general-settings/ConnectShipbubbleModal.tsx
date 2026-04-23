"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Truck } from "lucide-react";
import { useState } from "react";

const ConnectShipbubbleModal = ({
  open,
  onClose,
  onConnect,
}: {
  open: boolean;
  onClose: () => void;
  onConnect?: () => void;
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-6 bg-white">
        <DialogHeader className="space-y-0">
          {/* Logos */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <Truck className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-slate-400">🔗</span>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <span className="text-2xl">😍</span>
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-slate-900">
            Connect Shipbubble to your store
          </DialogTitle>
          <p className="text-center text-sm text-slate-500 mt-2">
            To activate automated shipping, we'll link your store to
            Shipbubble, the delivery partner.
          </p>
        </DialogHeader>

        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-900 mb-2">
            By connecting:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>
                You authorise Shipbubble to handle delivery for your Bumpa
                orders
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>
                Shipbubble riders will pick up directly from the address you
                provide
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>
                You'll be able to book deliveries straight from your dashboard
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>
                Tracking updates will be sent automatically to customers
              </span>
            </li>
          </ul>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-slate-700">
            I agree to shipbubble's{" "}
            <span className="text-green-600 font-medium">
              terms and conditions
            </span>
          </span>
        </label>

        <Button
          onClick={() => {
            if (onConnect) onConnect();
            else onClose();
          }}
          disabled={!agreed}
          className="w-full h-11 mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-400"
        >
          Connect
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectShipbubbleModal;
