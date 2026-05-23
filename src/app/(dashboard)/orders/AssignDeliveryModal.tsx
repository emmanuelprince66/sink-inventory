"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Phone, Star, Truck } from "lucide-react";
import { useState } from "react";

interface DeliveryPartner {
  id: string;
  name: string;
  logo: string;
  serviceType: string;
  contact: string;
  support: string;
  rating: number;
  estimatedCost: number;
  eta: string;
}

// Mock partners — replace with API once partners endpoint exists.
const MOCK_PARTNERS: DeliveryPartner[] = [
  {
    id: "shipbubble",
    name: "Shipbubble",
    logo: "SB",
    serviceType: "Multi-carrier aggregator",
    contact: "+234 700 100 1000",
    support: "support@shipbubble.com",
    rating: 4.6,
    estimatedCost: 2500,
    eta: "Same day",
  },
  {
    id: "kwik",
    name: "Kwik Delivery",
    logo: "KD",
    serviceType: "Bike & van",
    contact: "+234 700 200 2000",
    support: "help@kwik.delivery",
    rating: 4.4,
    estimatedCost: 1800,
    eta: "2-4 hours",
  },
  {
    id: "gig",
    name: "GIG Logistics",
    logo: "GIG",
    serviceType: "Nationwide courier",
    contact: "+234 700 300 3000",
    support: "care@giglogistics.com",
    rating: 4.2,
    estimatedCost: 3200,
    eta: "Next day",
  },
  {
    id: "dhl",
    name: "DHL Express",
    logo: "DHL",
    serviceType: "International express",
    contact: "+234 700 400 4000",
    support: "ng-express@dhl.com",
    rating: 4.8,
    estimatedCost: 6500,
    eta: "1-2 business days",
  },
  {
    id: "inhouse",
    name: "In-house Riders",
    logo: "IH",
    serviceType: "Local fleet",
    contact: "+234 700 500 5000",
    support: "ops@yourstore.com",
    rating: 4.5,
    estimatedCost: 1500,
    eta: "Same day",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  onAssigned?: (partner: DeliveryPartner) => void;
}

const AssignDeliveryModal = ({ isOpen, onClose, orderId, onAssigned }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const handleAssign = () => {
    const partner = MOCK_PARTNERS.find((p) => p.id === selected);
    if (!partner) return;
    setAssigning(true);
    // Simulated assignment — wire to real API when available.
    setTimeout(() => {
      setAssigning(false);
      onAssigned?.(partner);
      setSelected(null);
      onClose();
    }, 600);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Assign Delivery">
      <div className="space-y-4">
        {orderId && (
          <p className="text-xs text-gray-500">
            Assigning a delivery partner for order #{orderId.slice(0, 8)}
          </p>
        )}

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {MOCK_PARTNERS.map((partner) => {
            const isSelected = selected === partner.id;
            return (
              <button
                key={partner.id}
                onClick={() => setSelected(partner.id)}
                className={cn(
                  "w-full text-left border rounded-lg p-3 transition-all cursor-pointer",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                      {partner.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {partner.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {partner.rating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {partner.serviceType}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {partner.contact}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {partner.eta}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">
                      ₦{partner.estimatedCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">est. cost</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!selected || assigning}
            onClick={handleAssign}
          >
            {assigning ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default AssignDeliveryModal;
export { MOCK_PARTNERS };
export type { DeliveryPartner };
