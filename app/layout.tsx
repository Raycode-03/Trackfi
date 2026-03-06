// app/layout.tsx
import type { Metadata } from "next";
import { DM_Serif_Text } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
const dmSerifText = DM_Serif_Text({
  weight: ["400"], // Regular weight
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap", // Better performance
});

export const metadata: Metadata = {
  title: {
    default: "Savory & Co. | Premium Dining & Fast Delivery",
    template: "%s | Savory & Co.",
  },
  description: "Experience the finest flavors with Savory & Co. Browse our gourmet menu, order online, and enjoy premium dining delivered to your doorstep.",
  keywords: ["Restaurant", "Food Delivery", "Gourmet Dining", "Online Ordering", "Savory and Co"],
  authors: [{ name: "Akerele Raymond" }],
  openGraph: {
    title: "Savory & Co. | Premium Dining",
    description: "Gourmet meals delivered fast. Experience the heart of the city through flavor.",
    url: "https://raycode-restuarant-ordering-app.vercel.app/",
    siteName: "Savory & Co.",
    images: [
      {
        url: "/images/savory-preview.png",
        width: 1200,
        height: 630,
        alt: "Savory & Co. Restaurant Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Savory & Co. | Premium Dining",
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
      <body className={dmSerifText.variable}>
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