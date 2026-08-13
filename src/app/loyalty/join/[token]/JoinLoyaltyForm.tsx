"use client";

import { useJoinLoyaltyMutation } from "@/api/loyalty/join-loyalty";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LoyaltyJoin } from "@/types/loyalty";
import { Gift, PartyPopper } from "lucide-react";
import { useState } from "react";
import MemberProgress from "./MemberProgress";

// Customers reach this page by scanning a campaign QR code, so they are never
// signed in — everything here works anonymously off the join token in the URL.
const JoinLoyaltyForm = ({ token }: { token: string }) => {
  const [form, setForm] = useState<LoyaltyJoin>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });
  const [gender, setGender] = useState<string>("");
  const [birthday, setBirthday] = useState("");
  const [referral, setReferral] = useState("");
  // Set once the join succeeds — the API hands back the member's loyalty code,
  // which is what the progress endpoint is keyed on.
  const [loyaltyCode, setLoyaltyCode] = useState<string | null>(null);

  const { mutate: join, isPending } = useJoinLoyaltyMutation({
    token,
    onSuccess: (res: any) => {
      const code =
        res?.data?.loyalty_code ??
        res?.data?.code ??
        res?.data?.member_id ??
        res?.data?.id ??
        null;
      setLoyaltyCode(code ? String(code) : "");
    },
  });

  const set = (key: keyof LoyaltyJoin, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    (Boolean(form.phone?.trim()) || Boolean(form.email?.trim()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    join({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      // Send only what was filled in — the API rejects empty strings on
      // optional fields rather than ignoring them.
      ...(form.phone?.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.email?.trim() ? { email: form.email.trim() } : {}),
      ...(birthday ? { birthday } : {}),
      ...(gender ? { gender: gender as LoyaltyJoin["gender"] } : {}),
      ...(referral.trim() ? { referral_code: referral.trim() } : {}),
    });
  };

  if (loyaltyCode !== null) {
    return (
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <span className="w-16 h-16 rounded-full bg-primary-green-300/10 flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-primary-green-300" />
          </span>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-grey-1">You&apos;re in!</h2>
          <p className="text-sm text-grey-3 mt-1">
            Welcome aboard, {form.first_name}. Start earning on your next visit.
          </p>
        </div>

        {loyaltyCode ? (
          <div className="bg-grey-6/70 rounded-2xl p-4">
            <p className="text-xs font-bold text-grey-2 mb-1">
              Your loyalty code
            </p>
            <p className="text-lg font-extrabold tracking-wider text-primary-green-300 break-all">
              {loyaltyCode}
            </p>
            <p className="text-[11px] text-grey-3 mt-1">
              Show this at checkout to collect rewards.
            </p>
          </div>
        ) : null}

        {loyaltyCode ? <MemberProgress loyaltyCode={loyaltyCode} /> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center space-y-1">
        <div className="flex justify-center mb-2">
          <span className="w-14 h-14 rounded-full bg-primary-green-300/10 flex items-center justify-center">
            <Gift className="w-7 h-7 text-primary-green-300" />
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-grey-1">
          Join the rewards programme
        </h1>
        <p className="text-sm text-grey-3">
          Add your details to start earning on every visit.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-grey-2 mb-1 block">
            First name *
          </label>
          <Input
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            placeholder="Ada"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-grey-2 mb-1 block">
            Last name *
          </label>
          <Input
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            placeholder="Obi"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-grey-2 mb-1 block">
          Phone number
        </label>
        <Input
          value={form.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="080..."
          inputMode="tel"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-grey-2 mb-1 block">Email</label>
        <Input
          value={form.email ?? ""}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@example.com"
          type="email"
        />
      </div>

      <p className="text-[11px] text-grey-3 -mt-2">
        Give us a phone number or an email so we can reach you about rewards.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-grey-2 mb-1 block">
            Birthday
          </label>
          <Input
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            type="date"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-grey-2 mb-1 block">
            Gender
          </label>
          <Select onValueChange={setGender} value={gender}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Prefer not to say" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-grey-2 mb-1 block">
          Referral code (optional)
        </label>
        <Input
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
          placeholder="Who told you about us?"
        />
      </div>

      <Button
        type="submit"
        disabled={!canSubmit || isPending}
        className="w-full gap-2 h-11"
      >
        {isPending && <Spinner className="w-4 h-4" />}
        Join now
      </Button>
    </form>
  );
};

export default JoinLoyaltyForm;
