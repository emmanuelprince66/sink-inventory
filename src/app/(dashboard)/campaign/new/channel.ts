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
 * One unit buys one SMS; an email costs two. Kept beside the channel rather
 * than inline in the estimate panel because the same numbers appear on the
 * picker cards, in the credit estimate and in the pre-send check.
 */
export const CREDITS_PER_MESSAGE: Record<CampaignChannel, number> = {
  SMS: 1,
  EMAIL: 2,
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
      "2 credits per email",
      "Subject & preview text",
      "Live email preview",
    ],
  },
];

export const getChannelConfig = (channel: CampaignChannel) =>
  CHANNELS.find((option) => option.key === channel)!;
