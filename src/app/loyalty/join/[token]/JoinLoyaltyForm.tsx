"use client";

import { useJoinLoyaltyMutation } from "@/api/loyalty/join-loyalty";
import DataGapBadge from "@/components/app/DataGapBadge";
import { Spinner } from "@/components/app/Spinner";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Everything above the form is campaign branding — business name, reward,
// streak length. None of it can be loaded yet: there is no public endpoint
// that resolves a join token to its programme, only POST /loyalty/join/{token}.
// The copy below is the design's own, and the badge asks for the lookup that
// would make it real.
const FALLBACK = {
  business: "Our Store",
  programme: "Loyalty Rewards",
  reward: "A reward",
  trigger: "Complete the streak",
  streakLength: 5,
};

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
  const [joined, setJoined] = useState(false);

  const { mutate: join, isPending } = useJoinLoyaltyMutation({
    token,
    onSuccess: () => setJoined(true),
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
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-2xl font-extrabold text-grey-1">
          You&apos;re in!
        </h1>
        <p className="mt-2 text-sm text-grey-3">
          Your loyalty card is active. Show your phone number at checkout and
          we&apos;ll track every visit for you.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-6/40">
      {/* Hero */}
      <header className="relative bg-primary-green-100 px-4 pb-24 pt-6 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            🏪 {FALLBACK.business}
          </span>

          <div className="mt-6 text-4xl" aria-hidden>
            🎁
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            {FALLBACK.programme}
          </h1>

          <div className="mx-auto mt-5 w-fit rounded-2xl bg-white/10 px-8 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-green-300">
              Your Reward
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white">
              {FALLBACK.reward}
            </p>
            <p className="mt-0.5 text-[11px] text-white/60">
              {FALLBACK.trigger}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <DataGapBadge
              label="Campaign details are placeholder"
              needs="No public endpoint resolves a join token to its campaign. Needed: GET /loyalty/join/{token}/ returning business name, programme name, reward summary, trigger summary and streak length, so the landing page can show the real campaign instead of placeholder copy."
            />
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

        {/* Visit streak */}
        <section className="mt-6 rounded-2xl bg-primary-green-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-green-300">
            Visit Streak
          </p>
          <ol className="mt-4 space-y-3">
            {Array.from({ length: FALLBACK.streakLength - 1 }, (_, i) => (
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
                {FALLBACK.reward}
              </span>
            </li>
          </ol>
        </section>

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
              {FALLBACK.business}
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
