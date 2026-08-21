"use client";

import { useAddReferralParticipantMutation } from "@/api/customer-referral";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

/**
 * Enrolling a customer. The API mints the code and the referral link from the
 * name and phone, so there is nothing else to collect.
 */
const AddParticipantForm = ({
  programmeId,
  onAdded,
  onCancel,
}: {
  programmeId: string;
  onAdded: () => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: addParticipant, isPending } =
    useAddReferralParticipantMutation({ programmeId, onSuccess: onAdded });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Enter the customer's name.");
    if (!phone.trim()) return setError("Enter the customer's phone number.");

    addParticipant({
      name: name.trim(),
      phone: phone.trim(),
      // The field is nullable, so an empty box sends null rather than "".
      email: email.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="flex w-full min-w-0 flex-col gap-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Customer Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chiamaka Obi"
          className="mt-2 h-11 rounded-xl"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Phone Number
        </label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          placeholder="e.g. 0801 234 5678"
          className="mt-2 h-11 rounded-xl"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
          Email <span className="text-primary-green-300">(Optional)</span>
        </label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="their@email.com"
          className="mt-2 h-11 rounded-xl"
        />
      </div>

      {error && <p className="text-xs font-medium text-error-1">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-11 flex-1 gap-2 rounded-xl"
          disabled={isPending}
        >
          {isPending && <Spinner className="h-4 w-4" />}
          Add &amp; generate link
        </Button>
      </div>
    </form>
  );
};

export default AddParticipantForm;
