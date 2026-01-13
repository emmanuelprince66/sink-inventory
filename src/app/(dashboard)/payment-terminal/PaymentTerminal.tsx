"use client";

import { Button } from "@/components/ui/button";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { CheckCircle2, Copy, Download } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";

const PaymentTerminal: React.FC = () => {
  const { TrxData, businessData } = useTransactionsHook({});
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (businessData?.store_url) {
      const storeUrl = `https://store.sync360.africa/o/${businessData.store_url}`;
      navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            "_"
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
        1.0
      );
    } catch (error) {
      console.error("Error generating image:", error);
      alert(
        `Failed to download payment terminal. Error: ${
          (error as Error).message
        }`
      );
    }
  };

  if (!TrxData?.data?.results?.wallet_details || !businessData) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment terminal...</p>
        </div>
      </div>
    );
  }

  const { wallet_details } = TrxData.data.results;
  const storeUrl = `https://store.sync360.africa/o/${businessData.store_url}`;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Payment Terminal Card */}
        <div
          id="payment-terminal-content"
          className="bg-emerald-50 rounded-3xl  overflow-hidden mb-8"
          style={{ minWidth: "900px" }}
        >
          {/* Header Section */}
          <div className="flex rounded-t-3xl overflow-hidden">
            {/* Aetos Domain - 80% */}
            <div className="w-4/5 bg-white rounded-tl-3xl rounded-bl-none rounded-tr-none rounded-br-3xl p-6 flex flex-col gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {businessData.name}
                </h1>
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2"
                    style={{ color: "#059669" }}
                  >
                    <span className="text-base">🌐</span>
                    <span className="text-sm font-medium">
                      www.sync360.africa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync360 by Aetos - 20% */}
            <div className="">
              <Image
                src="/asset/sink2.png"
                alt="sink-logo"
                className="w-full h-full object-contain"
                priority
                width={150}
                height={150}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="bg-emerald-50 rounded-b-3xl px-8 pb-8 pt-5">
            {/* Bank Badge */}
            <div className="flex justify-center mb-8">
              <div
                className="text-white px-6 py-2.5 rounded-full flex items-center gap-2.5 shadow-md"
                style={{ backgroundColor: "#059669" }}
              >
                <div
                  className="bg-white rounded-lg p-2"
                  style={{ color: "#059669" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-sm">
                  {wallet_details.bank_name}
                </span>
              </div>
            </div>

            {/* Account Number */}
            <div className="text-center mb-8">
              <h2 className="text-7xl font-black text-gray-900 tracking-tight mb-6 leading-none">
                {wallet_details.account_number}
              </h2>

              {/* Account Name Banner */}
              <div
                className="text-white py-4 px-6 rounded-xl shadow-md max-w-2xl mx-auto"
                style={{ backgroundColor: "#059669" }}
              >
                <p className="text-xs mb-1" style={{ color: "#d1fae5" }}>
                  Account Name:
                </p>
                <p className="text-lg font-bold">
                  {wallet_details.account_name}
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
              <span className="text-gray-700 font-semibold text-sm">
                We Accept →
              </span>
              <div className="flex gap-2.5">
                <div className="bg-white border-2 border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <div className="text-red-600 font-bold text-xs">
                    Mastercard
                  </div>
                </div>
                <div className="bg-white border-2 border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <div className="text-blue-600 font-bold text-xs">Verve</div>
                </div>
                <div className="bg-white border-2 border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <div className="text-blue-700 font-bold text-xs">VISA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with gradient green */}
          <div
            className="px-6 py-4 rounded-b-3xl"
            style={{
              background:
                "linear-gradient(to bottom right, #111827, #065f46, #047857)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Google Play & App Store */}
              <div className="flex gap-2 flex-shrink-0">
                <div className="bg-black rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                  </svg>
                  <div className="text-left">
                    <div
                      className="text-[8px] leading-none"
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      GET IT ON
                    </div>
                    <div className="text-[10px] text-white font-semibold leading-tight">
                      Google Play
                    </div>
                  </div>
                </div>
                <div className="bg-black rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div
                      className="text-[8px] leading-none"
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      Download on the
                    </div>
                    <div className="text-[10px] text-white font-semibold leading-tight">
                      App Store
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-center gap-2 text-white flex-shrink-0">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium">Payment</span>
              </div>

              {/* Marketing Automation */}
              <div className="flex items-center gap-2 text-white flex-shrink-0">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  Marketing Automation
                </span>
              </div>

              {/* Storefront */}
              <div className="flex items-center gap-2 text-white flex-shrink-0">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium">Storefront</span>
              </div>

              {/* Inventory Management */}
              <div className="flex items-center gap-2 text-white flex-shrink-0">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  Inventory management
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Store URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Store URL
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={storeUrl}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-sm font-mono text-gray-700 focus:outline-none focus:border-emerald-500 pr-4"
                />
              </div>
              <Button
                onClick={handleCopyUrl}
                className="hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 h-[46px]"
                style={{ backgroundColor: "#059669" }}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span className="font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span className="font-medium">Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Welcome Description */}
          <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
            <p className="text-emerald-900 font-medium text-base leading-relaxed text-center">
              💡 Welcome! This is your store's customized payment virtual
              terminal. Download, print, and display it prominently in your
              store to enable seamless and efficient customer payments.
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleDownload}
            className="w-full hover:bg-emerald-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl"
            style={{ backgroundColor: "#059669" }}
          >
            <Download size={22} className="mr-2" />
            Download Payment Terminal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTerminal;
