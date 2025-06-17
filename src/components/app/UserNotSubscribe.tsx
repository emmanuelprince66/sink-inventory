import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Gem, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

const UserNotSubscribe = () => {
  const router = useRouter();

  const handleUpgradeClick = () => {
    router.push("/plan"); // Replace with your actual premium page route
  };

  return (
    <div className=" mx-auto p-6">
      <Alert variant="destructive" className="mb-6 border border-gray-200">
        <Lock className="h-4 w-4" />
        <AlertTitle>Premium Feature Locked</AlertTitle>
        <AlertDescription>
          This action requires a premium subscription to access.
        </AlertDescription>
      </Alert>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Gem className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium leading-none">
            Unlock Premium Features
          </h3>
          <p className="text-sm text-muted-foreground">
            Subscribe to get full access to all exclusive features and content.
          </p>
          <Button
            onClick={handleUpgradeClick}
            className="w-full text-white gap-1"
          >
            <Gem className="h-4 w-4" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserNotSubscribe;
