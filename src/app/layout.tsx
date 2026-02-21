import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mohamad Tahmasbi — Backend Developer",
  description:
    "Software Engineer with 3+ years of experience in Backend Development, Telegram Bot Automation, and DevOps. Explore my portfolio through an interactive API explorer.",
  keywords: [
    "Mohamad Tahmasbi",
    "Backend Developer",
    "TypeScript",
    "Node.js",
    "Express.js",
    "Telegram Bot",
    "DevOps",
    "REST API",
    "Software Engineer",
  ],
  authors: [{ name: "Mohamad Tahmasbi" }],
  openGraph: {
    title: "Mohamad Tahmasbi — Backend Developer",
    description:
      "Software Engineer specializing in Backend Development, Bot Automation & DevOps. Explore my work through an interactive API explorer.",
    type: "website",
    locale: "en_US",
    siteName: "mohamad.dev/api",
  },
  twitter: {
    card: "summary",
    title: "Mohamad Tahmasbi — Backend Developer",
    description:
      "Software Engineer specializing in Backend Development, Bot Automation & DevOps.",
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
