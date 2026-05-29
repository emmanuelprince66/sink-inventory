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

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://business.sync360.africa";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sink Inventory — Inventory & POS Management",
    template: "%s | Sink Inventory",
  },
  description:
    "Sink Inventory by Sync360 helps you manage inventory, point of sale, and stock in real time.",
  applicationName: "Sink Inventory",
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
    siteName: "Sink Inventory",
    title: "Sink Inventory — Inventory & POS Management",
    description:
      "Sink Inventory by Sync360 helps you manage inventory, point of sale, and stock in real time.",
    url: SITE_URL,
    locale: "en_US",
    // og image is auto-generated from src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Sink Inventory — Inventory & POS Management",
    description:
      "Sink Inventory by Sync360 helps you manage inventory, point of sale, and stock in real time.",
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
            {/* <NotificationProvider>
            
            </NotificationProvider> */}
          </FcmNotificationProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
