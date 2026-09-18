"use client";

import blackSendIcon from "@/assets/black-send-icon.png";
import bottomGraySnake from "@/assets/bottom-gray-snake.png";
import orangeSendIcon from "@/assets/orange-send-icon.png";
import logo from "@/assets/sink2.png";
import topGraySnake from "@/assets/top-gray-snake.png";
import transferIdeaIcon from "@/assets/transfer-idea-icon.png";
import yellowBgBehindQr from "@/assets/yellow-bg-behind-qr.png";
import yellowSnake from "@/assets/yellow-snake.png";
import { Button } from "@/components/ui/button";
import { AppStoreGlyph, GooglePlayGlyph } from "@/components/app/StoreGlyphs";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { Download } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import QRCodeModule from "react-qr-code";

const QRCode = QRCodeModule as any;

const StarBurst = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#292D32" className={className} aria-hidden>
    <path d="M12 0c.62 6.24 5.76 11.38 12 12-6.24.62-11.38 5.76-12 12-.62-6.24-5.76-11.38-12-12C6.24 11.38 11.38 6.24 12 0Z" />
  </svg>
);

export default function HomePage(): React.ReactElement {
  const { businessData } = useTransactionsHook({});
  const [activeTab, setActiveTab] = useState<"INSTORE" | "OUTSTORE">("INSTORE");

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

    return activeTab === "INSTORE"
      ? `${baseUrl}/i/${slug}`
      : `${baseUrl}/o/${slug}`;
  };

  const storeUrl = getStoreUrl();
  // const cliqId = TrxData?.data?.results?.wallet_details?.account_number ?? "";

  const handleDownload = async () => {
    const element = document.getElementById("qr-poster-content");
    if (!element) {
      alert("QR poster not found");
      return;
    }

    try {
      const html2canvas = (await import("html2canvas-pro")).default;

      // Make sure every image (esp. the Next/Image assets) is fully decoded
      // before html2canvas paints — otherwise it can capture a partially
      // loaded frame (the broken-looking yellow QR backdrop you saw).
      const images = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete
            ? img.decode().catch(() => {})
            : new Promise<void>((resolve) => {
                img.onload = () =>
                  img
                    .decode()
                    .then(() => resolve())
                    .catch(() => resolve());
                img.onerror = () => resolve();
              }),
        ),
      );

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        // html2canvas re-evaluates your CSS media queries inside a cloned
        // off-screen iframe sized to windowWidth/windowHeight. Your `sm:`
        // classes need viewport width >= 640px to apply. element.scrollWidth
        // (~595px) is under that, so the clone was silently falling back to
        // the mobile-size classes. Forcing >= 640 here matches what you
        // actually see on screen.
        windowWidth: Math.max(element.scrollWidth, 800),
        windowHeight: Math.max(element.scrollHeight, 800),
        imageTimeout: 15000, // give slow-loading assets more room before html2canvas gives up on them
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
    <div className="w-full max-w-[595px] mx-auto">
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

      {/* The poster. Only this node is captured — the Download button below
          must never end up inside its own screenshot. */}
      <div
        id="qr-poster-content"
        className="relative w-full overflow-hidden rounded-[8px] border border-[#E5E5E5] bg-white"
      >
        <Image src={topGraySnake} alt="" aria-hidden priority className="pointer-events-none absolute left-0 top-0 w-full h-auto" />
        <Image src={bottomGraySnake} alt="" aria-hidden priority className="pointer-events-none absolute left-0 bottom-0 w-full h-auto" />
        <Image src={yellowSnake} alt="" aria-hidden priority className="pointer-events-none absolute left-0 bottom-0 w-full h-auto" />
        <StarBurst className="pointer-events-none absolute left-[22.5%] top-[49px] sm:top-[86px] w-[11px] sm:w-[20px] rotate-[12deg]" />
        <Image src={transferIdeaIcon} alt="" aria-hidden priority className="pointer-events-none absolute left-[72.6%] top-[130px] sm:top-[229px] w-[16px] sm:w-[29px] h-auto" />
        <Image src={blackSendIcon} alt="" aria-hidden priority className="pointer-events-none absolute left-[8.6%] top-[241px] sm:top-[426px] w-[15px] sm:w-[26px] h-auto" />
        <Image src={orangeSendIcon} alt="" aria-hidden priority className="pointer-events-none absolute left-[87.7%] top-[388px] sm:top-[686px] w-[21px] sm:w-[37px] h-auto" />

        <div className="relative px-[10%] pt-[31px] pb-[54px] sm:pt-[55px] sm:pb-[95px]">
          <h1 className="text-center text-[26px] sm:text-[46px] font-extrabold uppercase leading-[1.1] tracking-tight text-green-500">
              Scan to
              <br />
              check price
          </h1>
          <Image src={logo} alt="Sync360" priority className="mx-auto w-[136px] sm:w-[240px] h-auto -my-[18px] sm:-my-[33px]" />

          <div className="relative mx-auto mt-[28px] sm:mt-[50px] w-[145px] sm:w-[256px]">
              <Image src={yellowBgBehindQr} alt="" aria-hidden priority className="pointer-events-none absolute -left-[10px] -top-[11px] sm:-left-[17px] sm:-top-[20px] w-[165px] sm:w-[290px] max-w-none h-auto" />
              <div className="relative rounded-[8px] sm:rounded-[12px] bg-white p-[13px] sm:p-[23px] shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
                <QRCode
                  value={storeUrl}
                  size={256}
                  viewBox="0 0 256 256"
                  style={{ width: "100%", height: "auto" }}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
          </div>

          <p className="mt-[14px] sm:mt-[24px] text-center text-[11px] sm:text-[19px] font-extrabold uppercase text-[#1D1F22]">
            {activeTab === "INSTORE" ? "In-Store Pricing Access" : "Out-Store Pricing Access"}
          </p>
          <p className="mt-[18px] sm:mt-[31px] text-center text-[8px] sm:text-[13px] font-medium text-[#4A4A4A]">
            Or visit <span className="font-bold text-green-500">{storeUrl}</span>
          </p>
          <p className="mt-[18px] sm:mt-[31px] text-center text-[8px] sm:text-[13px] font-medium text-[#4A4A4A]">
            Use your phone camera or any QR code reader to scan and access instant pricing information
          </p>
          <div className="mx-auto mt-[11px] sm:mt-[20px] h-px w-[210px] sm:w-[370px] max-w-full bg-[#E6E6E6]" />
          <p className="mt-[11px] sm:mt-[19px] rounded-full bg-[#202020] px-4 py-2 text-center text-[8px] sm:text-[13px] font-bold text-white">
            Powered by sync360.africa
          </p>
          <div className="mt-[11px] sm:mt-[19px] flex items-center justify-center gap-[7px] sm:gap-[12px]">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-[4px] sm:rounded-[6px] bg-black px-[7px] py-[4px] sm:px-[12px] sm:py-[7px]">
              <GooglePlayGlyph className="w-[12px] h-[12px] sm:w-[21px] sm:h-[21px] flex-shrink-0" />
              <span className="text-[8px] sm:text-[14px] text-white font-semibold">Google Play</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-[4px] sm:rounded-[6px] bg-black px-[7px] py-[4px] sm:px-[12px] sm:py-[7px]">
              <AppStoreGlyph className="w-[12px] h-[12px] sm:w-[21px] sm:h-[21px] flex-shrink-0" />
              <span className="text-[8px] sm:text-[14px] text-white font-semibold">App Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button — deliberately outside #qr-poster-content */}
      <div className="mt-6">
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
  );
}
