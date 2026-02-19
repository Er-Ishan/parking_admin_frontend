import { LoadingProvider } from "@/contexts/LoadingContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from './providers';
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elite Parking Admin",
  description: "Elite Parking Admin",
  metadataBase: new URL("https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app"),
  openGraph: {
    title: "Elite Parking Admin",
    description: "Elite Parking Admin",
    url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app",
    siteName: "Elite Parking Admin",
    images: [
      {
        url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Elite Parking Admin",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Parking Admin",
    description: "Elite Parking Admin",
    images: ["https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app/og-image.jpg"],
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
