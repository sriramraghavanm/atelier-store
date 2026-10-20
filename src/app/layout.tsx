import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * One neutral grotesque, two weights. The reference uses a licensed
 * typeface (GT America); Inter is the closest freely-licensed substitute and
 * holds up at the 10-14px sizes this system lives at. To swap in a licensed
 * face later, replace this with `next/font/local` and keep the CSS variable
 * name — nothing else needs to change.
 */
const ui = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atelier",
  description: "Atelier store.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ui.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
