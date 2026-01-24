"use client";

import { Button } from "@/components/ui/button";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Megaphone,
  Package,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const PaymentTerminal = () => {
  const { TrxData, businessData } = useTransactionsHook({});
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!TrxData?.data?.results?.wallet_details || !businessData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg font-semibold">
            Loading payment terminal...
          </p>
        </div>
      </div>
    );
  }

  const { wallet_details } = TrxData.data.results;
  const storeUrl = `https://store.sync360.africa/o/${businessData.store_url}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const element = document.getElementById("payment-terminal-content");
    if (!element) {
      alert("Payment terminal not found");
      return;
    }

    try {
      const images = element.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => {
              console.warn("Image failed to load:", img.src);
              resolve(img);
            };
          }
        });
      });

      await Promise.all(imagePromises);

      const html2canvas = (await import("html2canvas-pro")).default;

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        imageTimeout: 15000,
        removeContainer: true,
        x: -60,
        y: -60,
        width: element.scrollWidth + 120,
        height: element.scrollHeight + 120,
      });

      canvas.toBlob(
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
          )}_payment_terminal_${Date.now()}.png`;
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
      alert(
        `Failed to download payment terminal. Error: ${
          (error as Error).message
        }`,
      );
    }
  };

  return (
    <div className="min-h-screen  py-3 sm:py-6 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Payment Terminal Card */}
        <div
          id="payment-terminal-content"
          className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden mb-4 sm:mb-6 md:mb-8 border border-emerald-100"
        >
          {/* Header Section with Gradient - COMPACT VERSION */}
          <div className="relative bg-gradient-to-r from-emerald-900 via-emerald-900 to-teal-900 p-3 sm:p-4 md:p-5">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative flex flex-row items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1 tracking-tight break-words leading-tight">
                  {businessData.name}
                </h1>
                <div className="flex items-center gap-1 text-emerald-100">
                  <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="text-xs">🌐</span>
                    <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap truncate">
                      {storeUrl.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg flex-shrink-0">
                <Image
                  src="/asset/sink2.png"
                  alt="sink-logo"
                  className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                  priority
                  width={64}
                  height={64}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-gradient-to-b from-gray-50 to-white px-3 sm:px-5 md:px-8 lg:px-10 py-4 sm:py-6 md:py-10">
            {/* Bank Badge */}
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-10">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-5 md:px-8 py-2 sm:py-2.5 md:py-3.5 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center gap-2 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="relative bg-white rounded-md sm:rounded-lg md:rounded-xl p-1 sm:p-1.5 md:p-2.5 shadow-inner">
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600" />
                </div>
                <span className="relative font-bold text-xs sm:text-sm md:text-base tracking-wide">
                  {wallet_details.bank_name}
                </span>
              </div>
            </div>

            {/* Account Number */}
            <div className="text-center mb-4 sm:mb-6 md:mb-10">
              <div className="mb-2">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-widest">
                  Account Number
                </span>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-5 md:p-8 mb-3 sm:mb-4 md:mb-6 shadow-inner">
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 tracking-wider leading-none break-all">
                  {wallet_details.account_number}
                </h2>
              </div>

              {/* Account Name Banner */}
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white py-2.5 sm:py-3.5 md:py-5 px-3 sm:px-5 md:px-8 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg max-w-2xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5"></div>
                <div className="relative">
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold mb-0.5 sm:mb-1 md:mb-1.5 text-emerald-100 uppercase tracking-wider">
                    Account Name
                  </p>
                  <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide break-words leading-tight">
                    {wallet_details.account_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap mb-4 sm:mb-6 md:mb-8">
              <span className="text-gray-700 font-bold text-xs sm:text-sm md:text-base">
                We Accept →
              </span>
              <div className="flex gap-2 sm:gap-2.5 md:gap-3">
                <div className="bg-white border-2 border-red-200 px-2.5 sm:px-3.5 md:px-5 py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-red-600 font-black text-[10px] sm:text-xs md:text-sm">
                    Mastercard
                  </div>
                </div>
                <div className="bg-white border-2 border-blue-200 px-2.5 sm:px-3.5 md:px-5 py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-blue-600 font-black text-[10px] sm:text-xs md:text-sm">
                    Verve
                  </div>
                </div>
                <div className="bg-white border-2 border-blue-300 px-2.5 sm:px-3.5 md:px-5 py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-blue-700 font-black text-[10px] sm:text-xs md:text-sm">
                    VISA
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-br from-gray-900 via-emerald-900 to-teal-900 px-3 sm:px-5 md:px-8 py-3 sm:py-4 md:py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>

            <div className="relative">
              {/* App Download Badges - Updated: row on both mobile and desktop */}
              <div className="flex flex-row flex-wrap justify-center items-center gap-2 mb-3 sm:mb-4 md:mb-6">
                <div className="bg-black hover:bg-gray-900 transition-colors rounded-md sm:rounded-lg md:rounded-xl px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 flex items-center gap-1.5 sm:gap-2 md:gap-2.5 cursor-pointer">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-400 leading-none">
                      GET IT ON
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white font-bold leading-tight">
                      Google Play
                    </div>
                  </div>
                </div>
                <div className="bg-black hover:bg-gray-900 transition-colors rounded-md sm:rounded-lg md:rounded-xl px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 flex items-center gap-1.5 sm:gap-2 md:gap-2.5 cursor-pointer">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[7px] sm:text-[8px] md:text-[9px] text-gray-400 leading-none">
                      Download on the
                    </div>
                    <div className="text-[10px] sm:text-xs md:text-sm text-white font-bold leading-tight">
                      App Store
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 text-center hover:bg-white/15 transition-colors">
                  <div className="bg-emerald-500 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-1.5 md:mb-2">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-white text-[9px] sm:text-[10px] md:text-xs font-semibold">
                    Payment
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 text-center hover:bg-white/15 transition-colors">
                  <div className="bg-emerald-500 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-1.5 md:mb-2">
                    <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-white text-[9px] sm:text-[10px] md:text-xs font-semibold">
                    Marketing
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 text-center hover:bg-white/15 transition-colors">
                  <div className="bg-emerald-500 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-1.5 md:mb-2">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-white text-[9px] sm:text-[10px] md:text-xs font-semibold">
                    Storefront
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 text-center hover:bg-white/15 transition-colors">
                  <div className="bg-emerald-500 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-1.5 md:mb-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-white text-[9px] sm:text-[10px] md:text-xs font-semibold">
                    Inventory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-10 border border-emerald-100">
          {/* Store URL */}
          <div className="mb-5 sm:mb-6 md:mb-8">
            <label className="block text-xs sm:text-sm md:text-base font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
              🔗 Your Store URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 items-stretch items-center justify-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={storeUrl}
                  readOnly
                  className="w-full h-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg sm:rounded-xl md:rounded-2xl text-[10px] sm:text-xs md:text-sm font-mono text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
              </div>
              <Button
                onClick={handleCopyUrl}
                className="sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-5 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-bold text-xs sm:text-sm md:text-base"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mb-5 sm:mb-6 md:mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-emerald-200/20 rounded-full -mr-10 sm:-mr-12 md:-mr-16 -mt-10 sm:-mt-12 md:-mt-16"></div>
            <div className="absolute bottom-0 left-0 w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-teal-200/20 rounded-full -ml-7 sm:-ml-8 md:-ml-12 -mb-7 sm:-mb-8 md:-mb-12"></div>
            <p className="relative text-emerald-900 font-semibold text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-center">
              💡 <strong>Welcome!</strong> This is your store's customized
              payment virtual terminal. Download, print, and display it
              prominently in your store to enable seamless customer payments.
            </p>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 sm:py-4 md:py-5 lg:py-6 text-sm sm:text-base md:text-lg lg:text-xl font-black rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 group"
          >
            <Download className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:animate-bounce" />
            Download Payment Terminal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTerminal;
