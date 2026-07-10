import { CustomCard } from "@/components/app/CustomCard";
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
    <CustomCard
      className="rounded-2xl border-grey-5 hover:shadow-md transition-shadow duration-200"
      contentClassName="p-4"
    >
      <div className="space-y-2">
        <p className="text-grey-1 text-sm leading-relaxed">{message}</p>
        <p className="text-grey-4 text-xs">{formatDate(created_at)}</p>
      </div>
    </CustomCard>
  );
}
