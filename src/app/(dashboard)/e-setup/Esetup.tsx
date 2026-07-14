"use client";

import { Button } from "@/components/ui/button";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { Download } from "lucide-react";
import type React from "react";
import { useState } from "react";
import QRCodeModule from "react-qr-code";

const QRCode = QRCodeModule as any;

interface BusinessData {
  name: string;
  store_url?: string;
  tag_line?: string;
  logo?: string;
}

export default function HomePage(): React.ReactElement {
  const { TrxData, businessData } = useTransactionsHook({});

  console.log("businessData---7", businessData);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"INSTORE" | "OUTSTORE">("INSTORE");

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
  //       <div className="text-center space-y-6">
  //         <div className="flex justify-center">
  //           <div className="relative w-16 h-16">
  //             <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full animate-spin" />
  //             <div className="absolute inset-1 bg-white rounded-full" />
  //           </div>
  //         </div>
  //         <div>
  //           <p className="text-gray-900 font-semibold text-lg mb-2">
  //             Loading QR Poster...
  //           </p>
  //           <p className="text-gray-500 text-sm">
  //             Preparing your e-pricing display
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (!businessData) {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <p className="text-grey-1 font-bold text-base">Error loading data</p>
      </div>
    );
  }

  const getStoreUrl = () => {
    const slug = businessData.store_url || "store";
    const baseUrl = "https://store.sync360.africa";

    if (activeTab === "INSTORE") {
      return `${baseUrl}/i/${slug}`;
    } else {
      return `${baseUrl}/o/${slug}`;
    }
  };

  const storeUrl = getStoreUrl();

  const handleDownload = async () => {
    const element = document.getElementById("qr-poster-content");
    if (!element) {
      alert("QR poster not found");
      return;
    }

    try {
      const html2canvas = (await import("html2canvas-pro")).default;

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const paddingSize = 80;
      const paddedCanvas = document.createElement("canvas");
      paddedCanvas.width = canvas.width + paddingSize * 2;
      paddedCanvas.height = canvas.height + paddingSize * 2;

      const ctx = paddedCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
        ctx.drawImage(canvas, paddingSize, paddingSize);
      }

      paddedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("Failed to generate image");
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const fileName = `${businessData.name.replace(
            /[^a-zA-Z0-9]/g,
            "_",
          )}_epricing_qr_${activeTab.toLowerCase()}_${Date.now()}.png`;
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        },
        "image/png",
        1.0,
      );
    } catch (error) {
      console.error("Error generating image:", error);
      alert(`Failed to download QR poster. Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-grey-1">
          E-Pricing QR Code
        </h1>
        <p className="text-grey-3 text-sm mt-1">
          Download and display your pricing access portal
        </p>
      </div>

      {/* Tab Selection */}
      <div className="mb-3 flex justify-center">
        <div className="inline-flex items-center border border-border-tint rounded-lg overflow-hidden">
          {[
            { key: "INSTORE", label: "In-Store" },
            { key: "OUTSTORE", label: "Out-Store" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "INSTORE" | "OUTSTORE")}
              className={`px-6 py-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-2"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-grey-3 mb-6 text-center">
        {activeTab === "INSTORE"
          ? "Display in your physical store for customers to check prices on-site"
          : "Display online, in emails, or for remote customers to check prices"}
      </p>

      {/* QR Poster Preview — this is the downloadable/printable in-store asset;
          intentionally keeps its own branded poster look (dark green header,
          "SCAN TO CHECK PRICE" signage) rather than the admin dashboard's
          grey/primary-green-300 tokens. The "Powered by" pill and Download
          button share one white card so they read as a single unit, but only
          #qr-poster-content (header + main content + Powered-by pill) is
          captured into the downloaded image — the Download button itself
          must never appear inside its own screenshot. */}
      <div className="mb-6 w-full bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div id="qr-poster-content" className="bg-white">
          {/* Dark Green Header Bar */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-4 md:px-8 md:py-6">
            <h2 className="text-white text-xl md:text-2xl font-bold mt-1">
              {businessData.name}
            </h2>
          </div>

          {/* Main Content Area */}
          <div className="px-6 py-8 md:px-12 md:py-12 flex flex-col items-center justify-center text-center space-y-8">
            {/* Headline */}
            <div className="space-y-2">
              <p className="text-gray-600 text-sm md:text-base font-medium">
                {activeTab === "INSTORE" ? "In-Store" : "Out-Store"} Pricing
                Access
              </p>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                <span className="block">SCAN TO</span>
                <span className="block text-emerald-600">CHECK PRICE</span>
              </h1>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-8 md:p-10 rounded-xl border border-grey-5">
              <div className="relative bg-white p-6 md:p-8 rounded-lg inline-block">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-primary-black-100 text-white text-[10px] md:text-xs font-bold rounded-full px-3 py-1.5 whitespace-nowrap">
                  {businessData.name}
                </div>
                <QRCode
                  value={storeUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: businessData.logo,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            {/* URL Section */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-widest">
                or visit
              </p>
              <p className="text-emerald-600 font-bold text-base md:text-lg break-all">
                {storeUrl.replace("https://", "")}
              </p>
            </div>

            {/* Alternative Text */}
            <div className="pt-4 border-t border-gray-200 w-full">
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Use your phone camera or any QR code reader to scan and access
                instant pricing information
              </p>
            </div>
          </div>

          {/* Powered by pill — inset, full width, matches the Download button below */}
          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <div className="w-full bg-primary-black-100 text-white rounded-full py-3 text-center text-xs md:text-sm font-bold tracking-wider">
              Powered by sync360.africa
            </div>
          </div>
        </div>

        {/* Download Button — same card, same pill shape/width as "Powered by",
            deliberately outside #qr-poster-content so it isn't captured in its own screenshot */}
        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <Button
            onClick={handleDownload}
            className="w-full rounded-full py-3 h-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download {activeTab === "INSTORE" ? "In-Store" : "Out-Store"} QR
            Poster
          </Button>
        </div>
      </div>
    </div>
  );
}
