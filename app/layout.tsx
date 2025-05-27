import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const font = Manrope({
  subsets: ["latin"],
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
      <body className={`${font.className} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
