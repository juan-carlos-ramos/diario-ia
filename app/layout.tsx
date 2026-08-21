import type { Metadata, Viewport } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import BuscadorModal from "@/components/BuscadorModal";
import { Suspense } from "react";

const serifFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1A1715",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://diario-ia.vercel.app"),
  title: {
    default: "DiarioIA — Noticias de Inteligencia Artificial en Español",
    template: "%s | DiarioIA",
  },
  description:
    "Las últimas noticias sobre inteligencia artificial, programación, automatización y educación tecnológica en español. Actualizado cada 24 horas.",
  keywords: [
    "inteligencia artificial",
    "IA",
    "programación",
    "vibe coding",
    "automatización",
    "modelos de lenguaje",
    "noticias IA",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DiarioIA",
  },
  openGraph: {
    title: "DiarioIA — Noticias de IA en Español",
    description: "Noticias de IA en español, actualizadas cada 24 horas.",
    locale: "es_ES",
    type: "website",
    siteName: "DiarioIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "DiarioIA — Noticias de IA en Español",
    description: "Noticias de IA en español, actualizadas cada 24 horas.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${serifFont.variable} ${sansFont.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <BuscadorModal />
        {children}
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
