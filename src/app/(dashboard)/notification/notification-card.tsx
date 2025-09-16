import { Card, CardContent } from "@/components/ui/card";
import moment from "moment";

interface NotificationCardProps {
  message: string;
  created_at: string;
}

export function NotificationCard({
  message,
  created_at,
}: NotificationCardProps) {
  // Format date using moment
  const formatDate = (dateString: string) => {
    const messageTime = moment(dateString);
    const now = moment();

    // If message is from today, show time
    if (messageTime.isSame(now, "day")) {
      return messageTime.format("h:mm A");
    }

    // If message is from yesterday
    if (messageTime.isSame(now.clone().subtract(1, "day"), "day")) {
      return "Yesterday " + messageTime.format("h:mm A");
    }

    // If message is from this year, show month and day
    if (messageTime.isSame(now, "year")) {
      return messageTime.format("MMM D, h:mm A");
    }

    // Otherwise show full date
    return messageTime.format("MMM D, YYYY h:mm A");
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-gray-900 text-sm leading-relaxed">{message}</p>
          <p className="text-gray-500 text-xs">{formatDate(created_at)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
