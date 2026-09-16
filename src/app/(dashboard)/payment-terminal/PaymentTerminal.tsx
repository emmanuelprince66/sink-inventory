"use client";

import blackSendIcon from "@/assets/black-send-icon.png";
import bottomGraySnake from "@/assets/bottom-gray-snake.png";
import orangeSendIcon from "@/assets/orange-send-icon.png";
import logo from "@/assets/sink2.png";
import topGraySnake from "@/assets/top-gray-snake.png";
import transferIdeaIcon from "@/assets/transfer-idea-icon.png";
import yellowSnake from "@/assets/yellow-snake.png";
import { AppStoreGlyph, GooglePlayGlyph } from "@/components/app/StoreGlyphs";
import { Button } from "@/components/ui/button";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { CheckCircle2, Copy, Download } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/**
 * The printed "Pay with transfer" card.
 *
 * Laid out against the 595px-wide reference design, which is also the pixel
 * width of the three decorative curves in src/assets — so they drop in at
 * w-full and land where the design puts them at any card width. Horizontal
 * insets are percentages for the same reason; only type and vertical rhythm
 * step down at the mobile breakpoint.
 */

/** Sparkle at the top left — the one mark not supplied as an asset. */
const StarBurst = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="#292D32" className={className} aria-hidden>
    <path d="M12 0c.62 6.24 5.76 11.38 12 12-6.24.62-11.38 5.76-12 12-.62-6.24-5.76-11.38-12-12C6.24 11.38 11.38 6.24 12 0Z" />
  </svg>
);

/** One row of the grey panel: BANK NAME / ACCOUNT NUMBER / ACCOUNT NAME. */
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-[10px] sm:text-[12.5px] font-semibold uppercase tracking-[0.02em] text-[#4B4B4B]">
      {label}
    </p>
    <p className="mt-1.5 sm:mt-2 text-[17px] sm:text-[23px] font-bold uppercase leading-tight tracking-tight text-[#2B2B2B] break-words">
      {value}
    </p>
  </div>
);

const RowDivider = () => (
  <div className="my-4 sm:my-[22px] h-px bg-[#E0E0E0]" />
);

const PaymentTerminal = () => {
  const { TrxData, businessData } = useTransactionsHook({});
  const [copied, setCopied] = useState(false);

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
        return new Promise((resolve) => {
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
        windowWidth: Math.max(element.scrollWidth, 800), // force sm: breakpoint on
        windowHeight: Math.max(element.scrollHeight, 800),
        imageTimeout: 15000,
        removeContainer: true,
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
    <div className="min-h-screen py-3 sm:py-6 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-[595px] mx-auto">
        {/* Payment Terminal Card */}
        <div
          id="payment-terminal-content"
          className="relative w-full overflow-hidden rounded-[8px] border border-[#E5E5E5] bg-white mb-4 sm:mb-6 md:mb-8"
        >
          {/* Decorative curves — full bleed, behind the content */}
          <Image
            src={topGraySnake}
            alt=""
            aria-hidden
            priority
            className="pointer-events-none absolute left-0 top-0 w-full h-auto"
          />
          <Image
            src={bottomGraySnake}
            alt=""
            aria-hidden
            priority
            className="pointer-events-none absolute left-0 bottom-0 w-full h-auto"
          />
          <Image
            src={yellowSnake}
            alt=""
            aria-hidden
            priority
            className="pointer-events-none absolute left-0 bottom-0 w-full h-auto"
          />

          {/* Marks near the top — offset in px from the top edge rather than by
              percentage, so a long account name growing the card cannot drag
              them down with it. */}
          <StarBurst className="pointer-events-none absolute left-[22.5%] top-[53px] sm:top-[93px] w-[18px] sm:w-[24px] rotate-[12deg]" />
          <Image
            src={transferIdeaIcon}
            alt=""
            aria-hidden
            priority
            className="pointer-events-none absolute left-[85.7%] top-[93px] sm:top-[164px] w-[26px] sm:w-[34px] h-auto"
          />

          {/* Content */}
          <div className="relative px-[14.5%] pt-[62px] pb-[50px] sm:pt-[110px] sm:pb-[89px]">
            {/* The logo asset carries ~28% transparent padding top and bottom;
                pulled back out so the spacing reads as the design's. */}
            <Image
              src={logo}
              alt="Sync360"
              priority
              className="mx-auto w-[142px] sm:w-[250px] h-auto -my-[19px] sm:-my-[34px]"
            />

            {/* Headline is a hair wider than the panel below it, so it reaches
                back over the horizontal inset rather than wrapping. */}
            <h1 className="-mx-[30px] sm:-mx-[42px] mt-[18px] sm:mt-[28px] text-center text-[25px] text-[#329661] sm:text-[44px] font-extrabold uppercase leading-none tracking-tight whitespace-nowrap">
              Pay with transfer
            </h1>

            {/* Account details panel — the two paper planes hang off it, so they
                keep their relationship to it whatever the card ends up doing. */}
            <div className="relative mt-[14px] sm:mt-[24px] rounded-[10px] bg-[#F2F2F2] px-[18px] py-[16px] sm:px-[30px] sm:py-[26px]">
              <Image
                src={blackSendIcon}
                alt=""
                aria-hidden
                priority
                className="pointer-events-none absolute -left-[30px] bottom-[43px] sm:-left-[53px] sm:bottom-[76px] w-[19px] sm:w-[24px] h-auto"
              />
              <Image
                src={orangeSendIcon}
                alt=""
                aria-hidden
                priority
                className="pointer-events-none absolute -right-[8px] -bottom-[36px] sm:-right-[14px] sm:-bottom-[64px] w-[24px] sm:w-[30px] h-auto"
              />
              <DetailRow label="Bank Name:" value={wallet_details.bank_name} />
              <RowDivider />
              <DetailRow
                label="Account Number:"
                value={wallet_details.account_number}
              />
              <RowDivider />
              <DetailRow
                label="Account Name:"
                value={wallet_details.account_name}
              />
            </div>

            <p className="mt-[50px] sm:mt-[89px] text-center text-[11px] sm:text-[13px] font-medium text-[#4A4A4A]">
              Payment with the Sync360 App is a Breeze!
            </p>

            <div className="mx-auto mt-[10px] sm:mt-[14px] h-px w-[280px] max-w-full bg-[#E6E6E6]" />

            {/* Store badges */}
            <div className="mt-[10px] sm:mt-[14px] flex items-center justify-center gap-[10px] sm:gap-[12px]">
              <div className="flex items-center gap-2 rounded-[6px] bg-black px-[10px] py-[6px] sm:px-[12px] sm:py-[7px]">
                <GooglePlayGlyph className="w-[18px] h-[18px] sm:w-[21px] sm:h-[21px] flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[6px] sm:text-[7px] uppercase text-white leading-none tracking-wide">
                    Get it on
                  </div>
                  <div className="text-[12px] sm:text-[14px] text-white font-semibold leading-tight">
                    Google Play
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-[6px] bg-black px-[10px] py-[6px] sm:px-[12px] sm:py-[7px]">
                <AppStoreGlyph className="w-[18px] h-[18px] sm:w-[21px] sm:h-[21px] flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[6px] sm:text-[7px] text-white leading-none">
                    Download on the
                  </div>
                  <div className="text-[12px] sm:text-[14px] text-white font-semibold leading-tight">
                    App Store
                  </div>
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
              💡 <strong>Welcome!</strong> This is your store&apos;s customized
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
