import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
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
  costInfo?: string;
}

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
  costInfo = "You will be charge 1 unit per SMS.",
}) => {
  const getActiveMethods = () => {
    const methods = [];
    if (sendingMethods.sms) methods.push("SMS");
    if (sendingMethods.whatsapp) methods.push("WhatsApp");
    if (sendingMethods.email) methods.push("Email");
    return methods.join(" + ");
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden self-start">
      <div className="flex">
        {/* Image Section - 30% */}
        <div className="w-[30%] bg-green-100 flex items-center justify-center p-4">
          <div className="w-full aspect-square flex items-center justify-center rounded-lg">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={320}
              height={320}
              className="rounded-lg object-cover shadow-sm w-full h-full"
            />
          </div>
        </div>

        {/* Content Section - 70% */}
        <div className="w-[70%] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
              className="mr-2"
              checked={isEnabled}
              onCheckedChange={onToggle}
            />
          </div>

          {isEnabled && (
            <div className="space-y-4">
              <Textarea
                placeholder={placeholder}
                className="min-h-[100px] resize-none"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
              />

              <div className="space-y-3">
                <p className="font-medium text-sm mt-2">
                  {sendingMethodsLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-col items-end gap-[2px]">
                    <p className="text-green-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-green-100">
                      Active
                    </p>
                    <Button
                      variant={sendingMethods.sms ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSendingMethodChange("sms")}
                      className="flex items-center gap-2"
                    >
                      {sendingMethods.sms && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      SMS
                    </Button>
                  </div>

                  <div className="flex flex-col items-end gap-[2px]">
                    <p className="text-yellow-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-yellow-100">
                      Coming soon
                    </p>
                    <Button
                      disabled={true}
                      variant={sendingMethods.whatsapp ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSendingMethodChange("whatsapp")}
                      className="flex items-center gap-2"
                    >
                      {sendingMethods.whatsapp && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      WhatsApp
                    </Button>
                  </div>

                  <div className="flex flex-col items-end gap-[2px]">
                    <p className="text-yellow-600 rounded p-[3px] text-[9px] flex items-center justify-center bg-yellow-100">
                      Coming soon
                    </p>
                    <Button
                      disabled={true}
                      variant={sendingMethods.email ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSendingMethodChange("email")}
                      className="flex items-center gap-2"
                    >
                      {sendingMethods.email && (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Email
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Sending via:</p>
                  <p className="font-medium">{getActiveMethods()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{costInfo}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignAutomationCard;
