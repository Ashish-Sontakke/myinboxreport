import type { Metadata } from "next";
import "./globals.css";
import {
  Manrope as SansFont,
  Space_Grotesk as DisplayFont,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/config";

const sansFont = SansFont({
  subsets: ["latin"],
  variable: "--font-sans",
});
const displayFont = DisplayFont({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: "@ashish_sontakke",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sansFont.variable} ${displayFont.variable} tracking-wide`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
