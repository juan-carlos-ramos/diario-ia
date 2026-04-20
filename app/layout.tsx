import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DiarioIA — Noticias de Inteligencia Artificial en Español",
  description:
    "Las últimas noticias sobre inteligencia artificial, programación, automatización y educación tecnológica en español. Actualizado cada 24 horas.",
  keywords: [
    "inteligencia artificial",
    "IA",
    "programación",
    "automatización",
    "educación",
    "noticias",
  ],
  openGraph: {
    title: "DiarioIA",
    description: "Noticias de IA en español, actualizadas cada 24 horas.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
