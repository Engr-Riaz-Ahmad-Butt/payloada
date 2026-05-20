import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jsonova.dev"),
  title: "JSONova - The modern JSON workspace for developers",
  description:
    "Format JSON, decode JWTs, compare payloads, and generate developer-ready outputs in a fast, privacy-first workspace.",
  keywords: [
    "JSON",
    "JSON editor",
    "JSON formatter",
    "JSON validator",
    "JSON viewer",
    "JSON diff",
    "JWT decoder",
    "JSON to TypeScript",
    "JSON to Zod",
    "JSON to Go",
    "JSON to Python",
    "JSON schema generator",
    "JSON tree viewer",
    "developer tools",
    "privacy-first",
  ],
  authors: [{ name: "Riaz Ahmad Butt" }],
  openGraph: {
    title: "JSONova - The modern JSON workspace for developers",
    description: "Format, validate, decode, and compare JSON in a fast, privacy-first workspace.",
    type: "website",
    url: "https://jsonova.dev",
    siteName: "JSONova",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "JSONova" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSONova - The modern JSON workspace for developers",
    description: "Format, validate, decode, and compare JSON in a fast, privacy-first workspace.",
    creator: "@riazahmadbutt",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
