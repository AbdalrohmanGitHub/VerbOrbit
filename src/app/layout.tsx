import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Naskh_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
  variable: "--font-naskh",
});

export const metadata: Metadata = {
  title: "VerbOrbit",
  description: "Deutsche Präfixverben sehen, die Satzklammer spüren und sie wiederholen.",
  applicationName: "VerbOrbit",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${jakarta.variable} ${naskh.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
