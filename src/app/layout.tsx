import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
  title: "JSONova - The modern JSON workspace for developers",
  description:
    "Format JSON, decode JWTs, compare payloads, and generate developer-ready outputs in a fast, privacy-first workspace.",
  keywords: ["JSON", "editor", "formatter", "JWT decoder", "JSON diff", "developer tools"],
  authors: [{ name: "Riaz Ahmad Butt" }],
  openGraph: {
    title: "JSONova - The modern JSON workspace for developers",
    description: "Format, validate, decode, and compare JSON in a fast, privacy-first workspace.",
    type: "website",
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
        {children}
      </body>
    </html>
  );
}
