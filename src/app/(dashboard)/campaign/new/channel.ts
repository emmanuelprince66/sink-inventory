import { Mail, MessageSquare } from "lucide-react";

/**
 * The two channels the composer can build for.
 *
 * The values are the ones the create-campaign endpoint expects ("SMS" /
 * "EMAIL"), so nothing has to be translated on the way out. WhatsApp is a
 * valid channel on the API but has no composer yet, so it is deliberately
 * absent here rather than offered and half-built.
 */
export type CampaignChannel = "SMS" | "EMAIL";

/**
 * What one recipient costs on each channel.
 *
 * Email is the cheaper of the two, not the dearer — 0.30 against an SMS's
 * 1.00. This read EMAIL: 2 until the pricing was confirmed, which overstated
 * an email campaign by nearly seven times and would have talked merchants out
 * of the channel they should be using.
 *
 * A fallback, not the source of truth: the estimate endpoint returns
 * `unit_cost` for the channel, and that figure is the one shown once it
 * arrives. These are what the picker cards quote before an audience exists.
 */
export const CREDITS_PER_MESSAGE: Record<CampaignChannel, number> = {
  SMS: 1,
  EMAIL: 0.3,
};

/** A single SMS segment. Longer messages would bill as multiple segments, so
 *  the composer caps input here instead of silently charging twice. */
export const SMS_MAX_CHARS = 160;

export const CHANNELS = [
  {
    key: "SMS" as const,
    icon: MessageSquare,
    label: "SMS",
    composerLabel: "Compose SMS Campaign",
    headerLabel: "SMS Campaign",
    description:
      "Send instant text messages directly to your customers' phones. Fast, direct, and high open-rate.",
    subtitle: "Fill in the details — see the preview update live on the right",
    cta: "Compose SMS",
    features: [
      `${SMS_MAX_CHARS} characters per SMS`,
      "1 credit per message",
      "Instant delivery",
      "Live phone preview",
    ],
  },
  {
    key: "EMAIL" as const,
    icon: Mail,
    label: "Email",
    composerLabel: "Compose Email Campaign",
    headerLabel: "Email Campaign",
    description:
      "Send rich, branded email campaigns with subject lines, preview text, and formatted content.",
    subtitle: "Build your email — the live preview on the right updates as you type",
    cta: "Compose Email",
    features: [
      "Unlimited message length",
      "0.3 credits per email — 70% cheaper than SMS",
      "Subject & preview text",
      "Live email preview",
    ],
  },
];

export const getChannelConfig = (channel: CampaignChannel) =>
  CHANNELS.find((option) => option.key === channel)!;
