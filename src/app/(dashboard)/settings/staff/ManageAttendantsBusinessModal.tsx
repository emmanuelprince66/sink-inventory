import { useUpdateAttendantBusinessesMutation } from "@/api/attendants/update-attendant-business";
import { useGetAllBusinessQuery } from "@/api/business/get-business";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/toast/useToast";
import { Building2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ManageAttendantBusinessesModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendant: {
    id: string;
    name: string;
    role: string;
    businesses: Array<{ id: string; name: string }>;
  };
}

export const ManageAttendantBusinessesModal = ({
  isOpen,
  onClose,
  attendant,
}: ManageAttendantBusinessesModalProps) => {
  const { showToast } = useToast();
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);

  const { data: allBusinessData, isLoading: allBusinessLoading } =
    useGetAllBusinessQuery();

  const { mutate: updateBusinesses, isPending: isUpdating } =
    useUpdateAttendantBusinessesMutation({
      onSuccess: (data) => {
        showToast(
          data.message || "Attendant businesses updated successfully",
          "success",
        );
        onClose();
      },
      onError: (error) => {
        showToast(error.message || "Failed to update businesses", "error");
      },
    });

  useEffect(() => {
    if (attendant?.businesses) {
      setSelectedBusinessIds(attendant.businesses.map((b) => b.id));
    }
  }, [attendant, isOpen]);

  const handleToggleBusiness = (businessId: string) => {
    setSelectedBusinessIds((prev) =>
      prev.includes(businessId)
        ? prev.filter((id) => id !== businessId)
        : [...prev, businessId],
    );
  };

  const handleRemoveBusiness = (businessId: string) => {
    setSelectedBusinessIds((prev) => prev.filter((id) => id !== businessId));
  };

  const handleSubmit = () => {
    if (selectedBusinessIds.length === 0) {
      showToast("Please select at least one business", "error");
      return;
    }
    updateBusinesses({
      attendantId: attendant.id,
      payload: { business_ids: selectedBusinessIds },
    });
  };

  const businesses: any[] = allBusinessData?.results || [];
  const selectedCount = selectedBusinessIds.length;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      trigger={false}
      title={`Manage Business Access — ${attendant?.name}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select which businesses this attendant can operate in.
        </p>

        {/* Selected badges */}
        {selectedCount > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm font-medium mb-2">
              Selected Businesses ({selectedCount})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedBusinessIds.map((id) => {
                const business = businesses.find((b) => b.id === id);
                if (!business) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {business.name}
                    <button
                      onClick={() => handleRemoveBusiness(id)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Business list */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Available Businesses</p>

          {allBusinessLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No businesses available</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {[...businesses]
                .sort((a, b) => {
                  const aSelected = selectedBusinessIds.includes(a.id);
                  const bSelected = selectedBusinessIds.includes(b.id);
                  if (aSelected && !bSelected) return -1;
                  if (!aSelected && bSelected) return 1;
                  return 0;
                })
                .map((business) => {
                  const isSelected = selectedBusinessIds.includes(business.id);
                  return (
                    <div
                      key={business.id}
                      onClick={() => handleToggleBusiness(business.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all shadow-sm ${
                        isSelected
                          ? "border-green-500 bg-primary/5"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleToggleBusiness(business.id)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-gray-900">
                            {business.name}
                          </p>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {business.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {business.city}, {business.state} — {business.country}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || selectedCount === 0}
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Updating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Update Businesses ({selectedCount})
              </div>
            )}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};
