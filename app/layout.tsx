import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
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
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
