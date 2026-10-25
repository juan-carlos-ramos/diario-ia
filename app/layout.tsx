import { SerwistProvider } from "@serwist/turbopack/react";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import BannerInstalarPWA from "@/components/BannerInstalarPWA";
import BottomNav from "@/components/BottomNav";
import BuscadorModal from "@/components/BuscadorModal";
import CachearGuardadosOffline from "@/components/CachearGuardadosOffline";

import "./globals.css";

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
  // Color de la barra del sistema por defecto (el script theme-bootstrap lo
  // sobreescribe con el tema REAL del usuario, que es manual).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4EF" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0705" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Activa los márgenes de seguridad (env(safe-area-inset-*)) del notch en modo standalone.
  viewportFit: "cover",
  colorScheme: "light dark",
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
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("diarioia_tema"),dark=t==="dark",root=document.documentElement;if(dark){root.classList.add("dark");root.setAttribute("data-theme","dark");}else{root.classList.remove("dark");root.setAttribute("data-theme","light");}var color=dark?"#0C0705":"#F7F4EF";var sync=function(){var metas=document.querySelectorAll('meta[name="theme-color"]');if(!metas.length){var m=document.createElement("meta");m.setAttribute("name","theme-color");m.setAttribute("content",color);document.head.appendChild(m);return;}for(var i=0;i<metas.length;i++){metas[i].removeAttribute("media");metas[i].setAttribute("content",color);}};sync();if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",sync);}}catch(e){}})();`,
          }}
        />
        <SerwistProvider swUrl="/serwist/sw.js" options={{ updateViaCache: "none" }}>
          <BuscadorModal />
          {children}
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
          {/* Banner flotante de instalación PWA */}
          <BannerInstalarPWA />
          {/* Infraestructura offline: precarga de guardados */}
          <CachearGuardadosOffline />
        </SerwistProvider>
        <Analytics />
      </body>
    </html>
  );
}
