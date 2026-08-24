// app/layout.tsx
import { SubscriptionNotificationModal } from "@/components/app/SubscriptionModal";
import TawkToChat from "@/components/app/TawkToChat";
import { AuthProvider } from "@/components/auth/auth-provider";
import { FcmNotificationProvider } from "@/components/providers/notification-provider";
import { ReactQueryProvider } from "@/providers/ReactQueryProviders";
import { ToastProvider } from "@/providers/ToastProvider";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Matches Figma reference: Convert Mobile Screens to Desktop/src/app/App.tsx uses
// fontFamily: "Nunito, sans-serif" (NUN constant, ~line 28) app-wide.
// weight: "variable" loads the full Nunito weight range (200-1000) — previously only
// 400/600/700 were loaded, so font-medium (500) and font-extrabold (800) were being
// browser-faked instead of rendering the real type file.
const nunito = Nunito({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://business.sync360.africa";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sync360 Inventory — Inventory & POS Management",
    template: "%s | Sync360 Inventory",
  },
  description:
    "Sync360 Inventory by Sync360 helps you manage inventory, point of sale, and stock in real time.",
  applicationName: "Sync360 Inventory",
  alternates: {
    canonical: "/",
  },
  // Gated business portal — keep out of search results.
  // Link previews (OG/Twitter) still work; only search indexing is disabled.
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Sync360 Inventory",
    title: "Sync360 Inventory — Inventory & POS Management",
    description:
      "Sync360 Inventory by Sync360 helps you manage inventory, point of sale, and stock in real time.",
    url: SITE_URL,
    locale: "en_US",
    // og image is auto-generated from src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Sync360 Inventory — Inventory & POS Management",
    description:
      "Sync360 Inventory by Sync360 helps you manage inventory, point of sale, and stock in real time.",
    // twitter image is also auto-generated from src/app/opengraph-image.tsx
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} antialiased`}>
        <ReactQueryProvider>
          <FcmNotificationProvider>
            <ToastProvider />
            <AuthProvider>
              {children}
              <SubscriptionNotificationModal />
            </AuthProvider>
            <TawkToChat /> {/* Add this component */}
          </FcmNotificationProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
