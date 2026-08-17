"use client";

import { useJoinLoyaltyMutation } from "@/api/loyalty/join-loyalty";
import { useFetchPublicCampaignQuery } from "@/api/loyalty/fetch-public-campaign";
import { Spinner } from "@/components/app/Spinner";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Campaign details come from the public token lookup — business name, reward,
// trigger and the streak length, all resolved before anyone signs up.
const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Tracking",
    text: "Every visit is recorded automatically",
  },
  {
    icon: "📱",
    title: "SMS Updates",
    text: "We'll notify you of your progress",
  },
  {
    icon: "🎂",
    title: "Birthday Treats",
    text: "Special surprise on your birthday",
  },
  {
    icon: "🔄",
    title: "Never Expires",
    text: "Keep earning rewards forever",
  },
];

const Field = ({
  label,
  icon,
  optional,
  hint,
  children,
}: {
  label: string;
  icon: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="flex items-center gap-1.5 text-sm font-bold text-grey-1">
      <span aria-hidden>{icon}</span>
      {label}
      {optional ? (
        <span className="text-[11px] font-medium text-grey-4">optional</span>
      ) : (
        <span className="text-error-1">*</span>
      )}
    </label>
    <div className="mt-1.5">{children}</div>
    {hint && <p className="mt-1.5 text-[11px] text-grey-3">{hint}</p>}
  </div>
);

const inputClass =
  "w-full h-11 rounded-xl border border-grey-5 bg-white px-3.5 text-sm text-grey-1 placeholder:text-grey-4 focus:outline-none focus:border-primary-green-300";

const JoinLoyaltyForm = ({ token }: { token: string }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<any | null>(null);
  // Read after mount — window is unavailable during SSR, and reading it during
  // render would desync the first client paint from the server HTML.
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const { data: campaignRes, isLoading: campaignLoading } =
    useFetchPublicCampaignQuery({ params: { token } });
  const campaign = campaignRes?.data;

  // Streak length is the VISIT condition's threshold. A spend-based programme
  // has no stamp count, so the streak list is simply not drawn for one.
  const visitCondition = campaign?.conditions?.find(
    (condition) => condition.type === "VISIT",
  );
  const streakLength = Number(visitCondition?.threshold ?? 0);

  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  /**
   * Saves the card as a PNG, the same html2canvas-pro path the merchant QR
   * card and the POS receipt use. Deliberately not window.print(): this page
   * is opened on a phone from a QR scan, where a download is what a customer
   * can actually keep.
   */
  const downloadCard = async () => {
    const element = cardRef.current;
    if (!element) return;

    setSaving(true);
    try {
      // The QR is inline SVG, so nothing to await, but any future <img> would
      // rasterise blank without this.
      await Promise.all(
        Array.from(element.querySelectorAll("img")).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        imageTimeout: 15000,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `loyalty_card_${joined?.loyalty_code ?? "card"}.png`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }, "image/png");
    } catch {
      // Nothing to recover — the card is still on screen to screenshot.
    } finally {
      setSaving(false);
    }
  };

  const { mutate: join, isPending } = useJoinLoyaltyMutation({
    token,
    onSuccess: (response: any) => setJoined(response?.data ?? {}),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!phone.trim()) return setError("Please enter your phone number.");

    // The API takes first and last name separately; the design asks for one
    // field, so split on the first space and keep the rest as the surname.
    const [first, ...rest] = fullName.trim().split(/\s+/);

    join({
      first_name: first,
      last_name: rest.join(" ") || first,
      phone: phone.trim(),
      email: email.trim() || undefined,
      birthday: birthday || null,
      address: address.trim() || undefined,
    });
  };

  if (joined) {
    // The join response returns the loyalty code, so the card can be shown
    // immediately — and the QR encodes that code, which is exactly what the
    // till scanner reads. No round trip, no separate endpoint.
    const loyaltyCode = joined.loyalty_code;
    const enrollment = joined.enrollment;

    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-4 py-12">
        <div className="text-center">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-3 text-2xl font-extrabold text-grey-1">
            {joined.already_joined ? "Welcome back!" : "You're in!"}
          </h1>
          <p className="mt-1.5 text-sm text-grey-3">
            Show this card at the till and we&apos;ll track every visit.
          </p>
        </div>

        <div
          ref={cardRef}
          className="w-full overflow-hidden rounded-2xl border border-grey-5 bg-white"
        >
          <div className="bg-primary-green-300 px-5 py-4 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
              Loyalty Card
            </p>
            <p className="mt-0.5 truncate text-lg font-extrabold text-white">
              {enrollment?.member_name ?? fullName}
            </p>
            <p className="truncate text-[11px] text-white/70">
              {joined.program ?? enrollment?.program_name}
            </p>
          </div>

          <div className="flex flex-col items-center px-5 py-5">
            {loyaltyCode && (
              <div className="rounded-xl border border-grey-5 bg-white p-3">
                <QRCode value={loyaltyCode} size={168} />
              </div>
            )}
            <p className="mt-3 font-mono text-base font-extrabold tracking-wider text-grey-1">
              {loyaltyCode}
            </p>
            <p className="mt-0.5 text-[11px] text-grey-3">
              Scan or read out this code
            </p>

            {enrollment?.reward_description && (
              <div className="mt-4 w-full rounded-xl bg-primary-green-500 px-4 py-3 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-primary-green-300">
                  Your Reward
                </p>
                <p className="mt-0.5 text-base font-extrabold text-grey-1">
                  {enrollment.reward_description}
                </p>
                {enrollment.remaining_message && (
                  <p className="mt-0.5 text-[11px] text-grey-3">
                    {enrollment.remaining_message}
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="border-t border-grey-6 py-2 text-center text-[9px] text-grey-4">
            Powered by Sync360
          </p>
        </div>

        <button
          onClick={downloadCard}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-green-300 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-primary-green-300/90 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {saving ? "Preparing..." : "Download My Card"}
        </button>

        <p className="text-center text-[11px] text-grey-3">
          Save it to your phone so you always have it with you.
        </p>
      </div>
    );
  }

  // A customer who scans a dead QR must be told so, not shown a working-looking
  // signup form that will fail on submit.
  if (campaignLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-6/40">
        <Spinner className="text-primary-green-300" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-5xl" aria-hidden>
          🔒
        </div>
        <h1 className="text-xl font-extrabold text-grey-1">
          This QR code isn&apos;t active
        </h1>
        <p className="text-sm text-grey-3">
          It may have expired, or the campaign behind it has ended. Ask a member
          of staff for a current code.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-6/40">
      {/* Hero */}
      <header className="relative bg-primary-green-100 px-4 pb-24 pt-6">
        {/* Public page — a customer arrives here by scanning, so there may be
            no history to go back to. Only render Back when there is. */}
        {canGoBack && (
          <button
            onClick={() => window.history.back()}
            className="mb-4 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <span aria-hidden>←</span>
            Back
          </button>
        )}

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs font-bold text-white">
            {campaign?.business_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={campaign.business_logo}
                alt=""
                className="h-6 w-6 rounded-full bg-white object-contain"
              />
            ) : (
              <span className="pl-2" aria-hidden>
                🏪
              </span>
            )}
            {campaign?.business_name ?? "Our Store"}
          </span>

          <div className="mt-6 text-4xl" aria-hidden>
            🎁
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            {campaign?.name ?? "Loyalty Rewards"}
          </h1>

          <div className="mx-auto mt-5 w-fit rounded-2xl bg-white/10 px-8 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-green-300">
              Your Reward
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white">
              {campaign?.reward_summary ?? "A reward"}
            </p>
            <p className="mt-0.5 text-[11px] text-white/60">
              {campaign?.trigger_summary ?? "Complete the streak"}
            </p>
          </div>

        </div>
      </header>

      {/* Curved cut-out under the hero, as in the design */}
      <div className="-mt-16 h-16 rounded-t-[2.5rem] bg-grey-6/40" />

      <main className="mx-auto max-w-3xl px-4 pb-16">
        {/* How it works */}
        <section className="text-center">
          <span className="text-xs font-bold text-primary-green-300">
            💡 How It Works
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-grey-1">
            Earn Rewards Every Time You Visit
          </h2>
          <p className="mt-1 text-sm text-grey-3">
            Complete the streak, earn the reward — then do it all over again!
          </p>
        </section>

        {/* Visit streak — only meaningful when the programme counts visits. */}
        {streakLength > 0 && (
        <section className="mt-6 rounded-2xl bg-primary-green-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-green-300">
            Visit Streak
          </p>
          <ol className="mt-4 space-y-3">
            {Array.from({ length: Math.max(streakLength - 1, 0) }, (_, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-white/80">
                  Visit {i + 1}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-base">
                🎁
              </span>
              <span className="text-sm font-extrabold text-white">
                Get Rewarded!
              </span>
              <span className="rounded-full bg-primary-green-300 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                {campaign?.reward_summary ?? "A reward"}
              </span>
            </li>
          </ol>
        </section>
        )}

        {/* Feature grid */}
        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-grey-5 bg-white p-4"
            >
              <div className="text-xl" aria-hidden>
                {feature.icon}
              </div>
              <p className="mt-2 text-sm font-extrabold text-grey-1">
                {feature.title}
              </p>
              <p className="mt-0.5 text-xs text-grey-3">{feature.text}</p>
            </div>
          ))}
        </section>

        {/* Join */}
        <div className="my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-grey-5" />
          <span className="text-[11px] font-medium text-primary-green-300">
            Join in 30 seconds
          </span>
          <span className="h-px flex-1 bg-grey-5" />
        </div>

        <section className="text-center">
          <span className="text-xs font-bold text-primary-green-300">
            🎁 Join Now — It&apos;s Free
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-grey-1">
            Activate Your Loyalty Card
          </h2>
          <p className="mt-1 text-sm text-grey-3">
            Fill in your details below to get started. We&apos;ll create your
            personal loyalty card instantly.
          </p>
        </section>

        <form
          onSubmit={submit}
          className="mt-5 space-y-5 rounded-2xl border border-grey-5 bg-white p-5 sm:p-6"
        >
          <Field label="Full Name" icon="👤">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Chiamaka Obi"
              className={inputClass}
            />
          </Field>

          <Field
            label="Phone Number"
            icon="📱"
            hint="We'll send you loyalty updates and reward notifications via SMS — no spam, ever."
          >
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="e.g. 0801 234 5678"
              className={inputClass}
            />
          </Field>

          <Field
            label="Email Address"
            icon="✉️"
            optional
            hint="We'll send your loyalty card and receipt confirmations here."
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="your@email.com"
              className={inputClass}
            />
          </Field>

          <Field
            label="Date of Birth"
            icon="🎂"
            optional
            hint="🎁 Sharing your birthday lets us surprise you with exclusive birthday offers and special treats — just for you! Completely optional."
          >
            <input
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              type="date"
              className={inputClass}
            />
          </Field>

          <Field
            label="Address"
            icon="📍"
            optional
            hint="Helps us personalise nearby offers and events. Completely optional."
          >
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your city or neighbourhood"
              className={inputClass}
            />
          </Field>

          <p className="rounded-xl bg-primary-green-500 px-3.5 py-3 text-[11px] leading-relaxed text-grey-2">
            By activating, you agree to receive loyalty updates from{" "}
            <span className="font-bold text-primary-green-300">
              {campaign?.business_name ?? "Our Store"}
            </span>{" "}
            via SMS/email. You can opt out at any time.
          </p>

          {error && (
            <p className="text-xs font-medium text-error-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl bg-primary-green-300 py-3.5 text-sm font-extrabold text-white transition-colors",
              isPending
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer hover:bg-primary-green-300/90",
            )}
          >
            {isPending ? <Spinner className="h-4 w-4" /> : <span>🎉</span>}
            Activate My Loyalty Card
          </button>
        </form>
      </main>
    </div>
  );
};

export default JoinLoyaltyForm;
