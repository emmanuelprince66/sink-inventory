import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Copy, ExternalLink, Globe } from "lucide-react";
import { useState } from "react";

interface StoreUrlCardProps {
  storeData: {
    storeUrl: string;
    inStoreUrl: string;
  };
}

export default function StoreUrlCard({ storeData }: any) {
  const [copySuccess, setCopySuccess] = useState<"out" | "in" | null>(null);

  const copyStoreUrl = async (url: string, type: "out" | "in") => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 pt-5">
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Globe className="w-5 h-5" />
          Store URLs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="outstore" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outstore">Out-Store</TabsTrigger>
            <TabsTrigger value="instore">In-Store</TabsTrigger>
          </TabsList>

          <TabsContent value="outstore" className="space-y-3">
            <p className="text-sm text-gray-600">
              Share this link with your customers to visit your online store
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                {storeData.storeUrl}
              </div>
              <Button
                onClick={() => copyStoreUrl(storeData.storeUrl, "out")}
                variant="outline"
                size="sm"
                className={`shrink-0 ${
                  copySuccess === "out"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "hover:bg-gray-50"
                } transition-all duration-200`}
              >
                {copySuccess === "out" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => window.open(storeData.storeUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Out-Store
            </Button>
          </TabsContent>

          <TabsContent value="instore" className="space-y-3">
            <p className="text-sm text-gray-600">
              Share this link for customers to browse in your physical store
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                {storeData.inStoreUrl}
              </div>
              <Button
                onClick={() => copyStoreUrl(storeData.inStoreUrl, "in")}
                variant="outline"
                size="sm"
                className={`shrink-0 ${
                  copySuccess === "in"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "hover:bg-gray-50"
                } transition-all duration-200`}
              >
                {copySuccess === "in" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => window.open(storeData.inStoreUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit In-Store
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
