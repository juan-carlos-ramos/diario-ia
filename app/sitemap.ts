import type { MetadataRoute } from "next";
import { listarFechasDisponibles, leerArchivoPorFecha } from "@/lib/noticias";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diario-ia.vercel.app";
  const fechas = listarFechasDisponibles();

  // Rutas estáticas
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/guardados`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Rutas dinámicas de todas las noticias históricas
  for (const fecha of fechas) {
    const archivo = leerArchivoPorFecha(fecha);
    if (!archivo || !archivo.noticias) continue;

    for (const noticia of archivo.noticias) {
      routes.push({
        url: `${baseUrl}/noticia/${noticia.id}`,
        lastModified: new Date(noticia.fechaAgregada || noticia.fechaPublicacion || Date.now()),
        changeFrequency: "never",
        priority: 0.8,
      });
    }
  }

  return routes;
}
