import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";

const font = Comic_Neue({
  subsets: ["latin"],
  variable: "--font-comic-neue",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "My Inbox Report - AI-Powered Gmail Analytics",
  description:
    "Transform your Gmail into actionable insights. AI-powered analytics for subscriptions, spending, and email patterns—processed securely with zero data storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>{children}</body>
    </html>
  );
}
