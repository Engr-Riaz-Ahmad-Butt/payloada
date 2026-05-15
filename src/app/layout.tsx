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
  title: "jsonLines — The JSON workspace for serious developers",
  description:
    "Experience unparalleled speed and precision in a terminal-inspired environment. jsonLines provides the tools you need to build, decode, and diff with absolute control.",
  keywords: ["JSON", "editor", "formatter", "JWT decoder", "JSON diff", "developer tools"],
  authors: [{ name: "Riaz Ahmad Butt" }],
  openGraph: {
    title: "jsonLines — The JSON workspace for serious developers",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
