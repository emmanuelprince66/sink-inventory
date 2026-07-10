import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Copy, Globe } from "lucide-react";
import { useState } from "react";

interface StoreUrlCardProps {
  storeData: {
    storeUrl: string;
    inStoreUrl: string;
  };
}

export default function StoreUrlCard({ storeData }: any) {
  const [activeTab, setActiveTab] = useState<"out" | "in">("out");
  const [copySuccess, setCopySuccess] = useState(false);

  const activeUrl =
    activeTab === "out" ? storeData.storeUrl : storeData.inStoreUrl;

  const copyStoreUrl = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border-tint p-5">
      <h3 className="font-extrabold text-grey-1 text-base mb-4">
        Store URLs
      </h3>

      {/* Big pill toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab("out")}
          className={cn(
            "flex-1 py-3 rounded-full text-sm font-bold transition-colors cursor-pointer",
            activeTab === "out"
              ? "bg-primary-green-300 text-white"
              : "bg-grey-6 text-grey-3 hover:text-grey-2",
          )}
        >
          Out Store
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("in")}
          className={cn(
            "flex-1 py-3 rounded-full text-sm font-bold transition-colors cursor-pointer",
            activeTab === "in"
              ? "bg-primary-green-300 text-white"
              : "bg-grey-6 text-grey-3 hover:text-grey-2",
          )}
        >
          In Store
        </button>
      </div>

      <p className="text-xs text-grey-3 mb-3">
        {activeTab === "out"
          ? "Share this link with your customers to visit your online store."
          : "Share this link for customers to browse in your physical store."}
      </p>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-grey-6 border border-grey-5 rounded-full px-4 py-2.5 font-mono text-sm text-grey-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {activeUrl}
        </div>
        <Button
          onClick={copyStoreUrl}
          variant="outline"
          size="sm"
          className={cn(
            "shrink-0 rounded-full transition-all duration-200",
            copySuccess
              ? "bg-success-2 border-success-1/30 text-success-1"
              : "hover:bg-grey-6",
          )}
        >
          {copySuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      <button
        type="button"
        className="flex items-center gap-1.5 text-primary-green-300 text-sm font-bold hover:text-primary-green-300/80 cursor-pointer"
        onClick={() => window.open(activeUrl, "_blank")}
      >
        <Globe className="w-4 h-4" />
        Visit Link Store
      </button>
    </div>
  );
}
