import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CheckCircle2, Zap } from "lucide-react";
import Image from "next/image";

interface SendingMethods {
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
}

interface CampaignAutomationCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  message: string;
  onMessageChange: (message: string) => void;
  sendingMethods: SendingMethods;
  onSendingMethodChange: (method: keyof SendingMethods) => void;
  placeholder: string;
  sendingMethodsLabel?: string;
  /** Shown as a pill under the description, e.g. "+ 60% retention boost". */
  highlight?: string;
  onSave?: () => void;
  saving?: boolean;
}

/** One SMS is 160 characters; anything longer is billed as another. */
const SMS_LENGTH = 160;

const CHANNELS = [
  { key: "sms", label: "SMS", status: "Active" },
  { key: "whatsapp", label: "WhatsApp", status: "Soon" },
  { key: "email", label: "Email", status: "Soon" },
] as const;

const CampaignAutomationCard: React.FC<CampaignAutomationCardProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  isEnabled,
  onToggle,
  message,
  onMessageChange,
  sendingMethods,
  onSendingMethodChange,
  placeholder,
  sendingMethodsLabel = "Send via:",
  highlight,
  onSave,
  saving,
}) => {
  const activeMethods = CHANNELS.filter(
    (channel) => sendingMethods[channel.key],
  ).map((channel) => channel.label);

  // Rounded up, and never zero — an empty automation still costs one send
  // once it fires, so "0 SMS" would understate what enabling it commits to.
  const segments = Math.max(1, Math.ceil(message.length / SMS_LENGTH));

  return (
    <div
      className={cn(
        "self-start overflow-hidden rounded-2xl border bg-white transition-colors",
        isEnabled ? "border-primary-green-300/40" : "border-grey-5",
      )}
    >
      {/* Header stays the same height whether or not the card is open, so a
          two-column grid of these does not jump when one is toggled. */}
      <div className="flex items-center gap-3 p-4">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-secondary-6">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={88}
            height={88}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-grey-1">{title}</h3>
          <p className="mt-0.5 text-xs text-grey-3">{description}</p>
          {highlight && (
            <span className="mt-1.5 inline-block rounded bg-secondary-6 px-1.5 py-0.5 text-[10px] font-bold text-primary-green-300">
              {highlight}
            </span>
          )}
        </div>

        <Switch
          className="shrink-0"
          checked={isEnabled}
          onCheckedChange={onToggle}
        />
      </div>

      {isEnabled && (
        <div className="border-t border-grey-5 p-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
            Message
          </label>

          <Textarea
            placeholder={placeholder}
            className="mt-2 min-h-[92px] resize-none rounded-xl"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
          />

          <p className="mt-1.5 text-[11px] text-grey-4">
            {message.length} characters · {segments} SMS
          </p>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-grey-3">
            {sendingMethodsLabel}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {CHANNELS.map((channel) => {
              const selected = sendingMethods[channel.key];
              const comingSoon = channel.status === "Soon";

              return (
                <button
                  key={channel.key}
                  type="button"
                  disabled={comingSoon}
                  onClick={() => onSendingMethodChange(channel.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                    comingSoon
                      ? "cursor-not-allowed bg-grey-6 text-grey-4"
                      : "cursor-pointer",
                    !comingSoon && selected
                      ? "bg-primary-green-300 text-white"
                      : !comingSoon && "bg-grey-6 text-grey-2 hover:bg-grey-5",
                  )}
                >
                  {/* The status rides inside the chip rather than floating
                      above it — stacked labels made every row a different
                      height and the buttons stopped lining up. */}
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 text-[9px] font-bold uppercase",
                      comingSoon
                        ? "bg-grey-5 text-grey-3"
                        : selected
                          ? "bg-white/25 text-white"
                          : "bg-secondary-6 text-primary-green-300",
                    )}
                  >
                    {channel.status}
                  </span>
                  {selected && !comingSoon && (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  {channel.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-grey-6 px-3 py-2">
            <p className="text-xs text-grey-3">
              Sending via:{" "}
              <span className="font-bold text-grey-1">
                {activeMethods.length ? activeMethods.join(" + ") : "None"}
              </span>
            </p>
            <p className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-grey-3">
              <Zap className="h-3 w-3 text-warning-1" />
              {segments} unit{segments === 1 ? "" : "s"} per SMS
            </p>
          </div>

          {onSave && (
            <Button
              onClick={onSave}
              disabled={saving}
              className="mt-4 h-11 w-full gap-1.5 rounded-xl"
            >
              <CheckCircle2 className="h-4 w-4" />
              Save Automation
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignAutomationCard;
