import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DiarioIA — Noticias de IA en Español",
    short_name: "DiarioIA",
    description:
      "Agregador inteligente de noticias de Inteligencia Artificial, Vibe Coding y Tecnología en español.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#00E5FF",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
