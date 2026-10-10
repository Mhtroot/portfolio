import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { site } from "@/data/responses";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.name }],
  openGraph: {
    title: site.title,
    description: site.ogDescription,
    type: "website",
    locale: "en_US",
    siteName: `${site.domain}/api`,
  },
  twitter: {
    card: "summary",
    title: site.title,
    description: site.ogDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
