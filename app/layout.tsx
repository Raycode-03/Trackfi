import type { Metadata } from "next";
import { DM_Serif_Text } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
const dmSerifText = DM_Serif_Text({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trackfi",
    template: "%s | Trackfi",
  },
  description:
    "Real-time crypto and personal finance tracker. Monitor your portfolio, track prices, and manage your finances in one place.",
  keywords: [
    "crypto tracker",
    "portfolio tracker",
    "personal finance",
    "bitcoin",
    "cryptocurrency",
    "Trackfi",
  ],
  authors: [{ name: "Akerele Raymond" }],
  openGraph: {
    title: "Trackfi — Track Your Crypto Portfolio",
    description:
      "Real-time crypto and personal finance tracker. Monitor your portfolio, track prices, and manage your finances in one place.",
    url: "https://trackfi.vercel.app",
    siteName: "Trackfi",
    images: [
      {
        url: "/images/trackfi-preview.png",
        width: 1200,
        height: 630,
        alt: "Trackfi Restaurant Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Trackfi | Premium Dining",
  //   description: "Gourmet meals delivered fast.",
  //   images: ["/og-image.jpg"],
  // },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={`${dmSerifText.variable} ${dmSerifText.className}`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          duration={4000}
          toastOptions={{
            className: "toast-with-progress",
          }}
        />
      </body>
    </html>
  );
}
