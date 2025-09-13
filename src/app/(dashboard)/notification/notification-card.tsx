import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  ExternalLinkIcon,
} from "lucide-react";

interface NotificationCardProps {
  message: string;
  created_at: string;
}

export function NotificationCard({
  message,
  created_at,
}: NotificationCardProps) {
  // Parse the message to extract transaction details
  const isReceived = message.includes("received from");
  const isSent = message.includes("You sent");

  // Extract amount from message
  const amountMatch = message.match(/₦[\d,]+\.?\d*/);
  const amount = amountMatch ? amountMatch[0] : "";

  // Extract recipient/sender name
  const nameMatch = message.match(/(to|from)\s+([A-Z\s]+)\./);
  const name = nameMatch ? nameMatch[2].trim() : "";

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Transaction Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isReceived
                ? "bg-accent/10 text-accent"
                : "bg-primary/10 text-primary"
            }`}
          >
            {isReceived ? (
              <ArrowDownIcon className="w-5 h-5" />
            ) : (
              <ArrowUpIcon className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-card-foreground text-sm">
                  {isReceived ? "Money Received" : "Money Sent"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isReceived ? "From" : "To"} {name}
                </p>
              </div>
              <Badge
                variant={isReceived ? "default" : "secondary"}
                className={`text-xs font-medium ${
                  isReceived
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {amount}
              </Badge>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <ClockIcon className="w-3 h-3" />
              <span>{formatDate(created_at)}</span>
            </div>

            {/* Action Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs h-8 bg-transparent"
            >
              <ExternalLinkIcon className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
