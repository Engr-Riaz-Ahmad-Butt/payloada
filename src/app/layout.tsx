import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JSONKit — The JSON workspace for serious developers",
  description:
    "Experience unparalleled speed and precision in a terminal-inspired environment. JSONKit provides the tools you need to build, decode, and diff with absolute control.",
  keywords: ["JSON", "editor", "formatter", "JWT decoder", "JSON diff", "developer tools"],
  authors: [{ name: "Riaz Ahmad Butt" }],
  openGraph: {
    title: "JSONKit — The JSON workspace for serious developers",
    description:
      "Build, decode, and diff JSON with absolute control. Terminal-inspired, developer-focused.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
