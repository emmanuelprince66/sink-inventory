// components/shared/not-authorized.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface NotAuthorizedProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function NotAuthorized({
  title = "Access Denied",
  message = "You don't have permission to view this page.",
  requiredPermission,
  showBackButton = true,
  showHomeButton = true,
}: NotAuthorizedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Required Permission Info */}
        {requiredPermission && (
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Required Permission:</span>{" "}
              <code className="bg-white px-2 py-1 rounded text-xs">
                {requiredPermission}
              </code>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center pt-4">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}

          {showHomeButton && (
            <Link href="/overview">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 pt-4">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
