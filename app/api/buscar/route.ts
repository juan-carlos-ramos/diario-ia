import { NextResponse } from "next/server";
import {
  listarFechasDisponibles,
  leerArchivoPorFecha,
  obtenerNoticiasDeHoy,
} from "@/lib/noticias";
import type { Noticia } from "@/lib/noticias";
import { obtenerTodasHerramientas } from "@/lib/herramientas";
import type { HerramientaIA } from "@/lib/herramientas";

export const revalidate = 3600;

/**
 * Route handler GET /api/buscar
 *
 * Alimenta al componente BuscadorModal (Cmd+K) con el catálogo completo
 * de herramientas de IA y las noticias de las últimas ediciones publicadas.
 */
export async function GET() {
  try {
    const fechas = listarFechasDisponibles();
    const noticiasMap = new Map<string, Noticia>();

    // Cargar las noticias de las últimas 14 ediciones disponibles
    const fechasRecientes = fechas.slice(0, 14);
    for (const fecha of fechasRecientes) {
      const archivo = leerArchivoPorFecha(fecha);
      if (archivo?.noticias) {
        for (const noticia of archivo.noticias) {
          if (!noticiasMap.has(noticia.id)) {
            noticiasMap.set(noticia.id, noticia);
          }
        }
      }
    }

    // Fallback si no se encontraron archivos en las fechas listadas
    if (noticiasMap.size === 0) {
      const archivoHoy = obtenerNoticiasDeHoy();
      if (archivoHoy?.noticias) {
        for (const noticia of archivoHoy.noticias) {
          noticiasMap.set(noticia.id, noticia);
        }
      }
    }

    const noticias: Noticia[] = Array.from(noticiasMap.values());
    const herramientas: HerramientaIA[] = obtenerTodasHerramientas();

    return NextResponse.json(
      { noticias, herramientas },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error al generar respuesta de /api/buscar:", error);
    return NextResponse.json(
      {
        noticias: [],
        herramientas: [],
        error: "Error interno al recuperar los datos de búsqueda",
      },
      { status: 500 }
    );
  }
}
