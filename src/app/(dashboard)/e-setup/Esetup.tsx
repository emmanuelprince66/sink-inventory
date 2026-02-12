"use client";

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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-900 font-semibold text-lg">
            Error loading data
          </p>
        </div>
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
    <div className="min-h-screen py-8 px-4 md:py-12 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            E-Pricing QR Code
          </h1>
          <p className="text-gray-600">
            Download and display your pricing access portal
          </p>
        </div>

        {/* Tab Selection */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
            {[
              {
                key: "INSTORE",
                label: "🏪 In-Store",
                description:
                  "Display in your physical store for customers to check prices on-site",
              },
              {
                key: "OUTSTORE",
                label: "📦 Out-Store",
                description:
                  "Display online, in emails, or for remote customers to check prices",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "INSTORE" | "OUTSTORE")}
                className={`py-2 md:py-3 px-4 rounded-md font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            {activeTab === "INSTORE"
              ? "Display in your physical store for customers to check prices on-site"
              : "Display online, in emails, or for remote customers to check prices"}
          </p>
        </div>

        {/* QR Poster Preview */}
        <div
          id="qr-poster-content"
          className="mb-8 w-full bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none"
        >
          {/* Dark Green Header Bar */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-6 py-4 md:px-8 md:py-6">
            {/* <p className="text-emerald-100 text-xs md:text-sm font-semibold tracking-wide uppercase">
              Aetos Domain
            </p> */}
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
            <div className="bg-gradient-to-b from-emerald-50 to-white p-8 md:p-10 rounded-xl relative border-2 border-emerald-100 shadow-inner">
              <div className="bg-white p-6 md:p-10 rounded-lg inline-block shadow-md ">
                <div className="bg-primary-black-100 text-sm md:text-md text-white rounded-b-xl absolute h-[45px] md:h-[60px] w-[150px] top-0 left-[85px] md:left-[103px] right-0 bottom-10 p-2 md:p-5">
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

          {/* Footer Badge */}
          <div className="bg-emerald-500 text-white px-6 py-3 md:px-8 md:py-4 text-center">
            <p className="text-xs md:text-sm font-bold tracking-wider">
              Powered by sync360.africa
            </p>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold py-3 md:py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mb-6"
        >
          <Download size={20} />
          <span>
            Download {activeTab === "INSTORE" ? "In-Store" : "Out-Store"} QR
            Poster
          </span>
        </button>

        {/* Info Section */}
      </div>
    </div>
  );
}
