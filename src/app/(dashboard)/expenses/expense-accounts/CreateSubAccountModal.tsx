"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import { Briefcase, Plus, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { MOCK_USERS } from "./mock-data";

interface CreateSubAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateSubAccountModal = ({
  isOpen,
  onClose,
}: CreateSubAccountModalProps) => {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [approvalThreshold, setApprovalThreshold] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setSpendingLimit("");
    setApprovalThreshold("");
    setAssignedUsers([]);
    setSubmitting(false);
  };

  const toggleUser = (id: string) => {
    setAssignedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      showToast("Please enter an account name.", "error");
      return;
    }
    if (assignedUsers.length === 0) {
      showToast("Assign at least one user to the account.", "error");
      return;
    }
    setSubmitting(true);
    // UI-only — wire to POST /expense-accounts/ once the backend ships.
    setTimeout(() => {
      showToast(`Sub-account "${name.trim()}" created.`, "success");
      reset();
      onClose();
    }, 700);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create Sub-Account"
      description="Carve a budget out of the main expense account."
      size="lg"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Briefcase className="w-4 h-4" />
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            variant="outline"
            className="border-slate-200"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Identity */}
        <div className="space-y-2">
          <Label htmlFor="account-name" className="font-semibold">
            Account Name
          </Label>
          <Input
            id="account-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing, Logistics, Branch Office"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-description" className="font-semibold">
            Description{" "}
            <span className="text-xs font-normal text-gray-400">
              (optional)
            </span>
          </Label>
          <Textarea
            id="account-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What is this account used for?"
            className="resize-none"
            disabled={submitting}
          />
        </div>

        {/* Spending controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="spending-limit" className="font-semibold">
              Spending Limit{" "}
              <span className="text-xs font-normal text-gray-400">
                (monthly, optional)
              </span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₦
              </span>
              <Input
                id="spending-limit"
                type="number"
                inputMode="decimal"
                min="0"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(e.target.value)}
                placeholder="0"
                className="pl-7"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approval-threshold" className="font-semibold">
              Requires approval above
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₦
              </span>
              <Input
                id="approval-threshold"
                type="number"
                inputMode="decimal"
                min="0"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(e.target.value)}
                placeholder="0"
                className="pl-7"
                disabled={submitting}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Transfers above this amount need a manager's approval.
            </p>
          </div>
        </div>

        {/* Assigned users */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Assigned Users
            </Label>
            <span className="text-[11px] text-gray-500">
              {assignedUsers.length} selected
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MOCK_USERS.map((user) => {
              const selected = assignedUsers.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  disabled={submitting}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors text-left",
                    selected
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      selected
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{user.role}</p>
                  </div>
                  {selected && (
                    <Plus className="w-3.5 h-3.5 text-emerald-700 rotate-45" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini summary */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <Wallet className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            New sub-accounts start at <span className="font-semibold">₦0</span>.
            Fund them from the main account using <em>Transfer Money</em>.
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default CreateSubAccountModal;
