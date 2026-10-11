import type { MetadataRoute } from "next";

/**
 * Manifiesto de la PWA "DiarioIA".
 *
 * Identidad visual: "The Modern Broadsheet" (OKLCH como fuente de verdad del
 * design system). El manifiesto usa HEX por compatibilidad universal con el
 * parser del sistema operativo; los HEX son el equivalente exacto de los tokens:
 *   · Papel prensa marfil  oklch(96.8% 0.007 75) ≈ #F7F4EF  -> background/theme claro
 *   · Carbón obsidiana     oklch(13.5% 0.012 55) ≈ #0C0705  -> theme oscuro
 *
 * NOTA: `theme_color` aquí es el valor por defecto (modo claro). El color de la
 * barra del sistema se sincroniza con el tema REAL del usuario (manual, por
 * localStorage) desde el script `theme-bootstrap` en app/layout.tsx y desde
 * components/BotonTema.tsx — ver lib/tema.ts.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DiarioIA — Noticias de IA en Español",
    short_name: "DiarioIA",
    description:
      "Agregador inteligente de noticias de Inteligencia Artificial, Vibe Coding y Tecnología en español.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F4EF",
    theme_color: "#F7F4EF",
    lang: "es",
    dir: "ltr",
    categories: ["news", "magazines"],
    icons: [
      // Iconos "any": badge auto-contenido, fondo transparente (preserva la marca original).
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Iconos "maskable": fondo sólido de marca (marfil) y contenido dentro del
      // círculo de seguridad del 80% central (radio máx. medido ≈ 0.32 < 0.40).
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Buscar",
        short_name: "Buscar",
        description: "Abrir el buscador global (Cmd/Ctrl + K)",
        url: "/#buscar",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Guardados",
        short_name: "Guardados",
        description: "Ver las noticias guardadas",
        url: "/guardados",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Herramientas",
        short_name: "Herramientas",
        description: "Directorio de herramientas de IA",
        url: "/herramientas",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
    ],
    // TODO(PWA): declarar `screenshots` (form_factor narrow + wide) cuando existan
    // capturas reales de la app; mejoran la ficha de instalación en Android.
    // No se declaran URLs inventadas para no prometer recursos inexistentes.
  };
}
