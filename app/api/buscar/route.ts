import { NextResponse } from "next/server";
import { obtenerNoticiasDeHoy, listarFechasDisponibles, leerArchivoPorFecha } from "@/lib/noticias";
import { obtenerTodasHerramientas } from "@/lib/herramientas";

export async function GET() {
  try {
    // Obtener noticias recientes (de hoy y fechas anteriores)
    const todasLasNoticias = [];
    const fechas = listarFechasDisponibles().slice(0, 3); // Últimos 3 días

    for (const fecha of fechas) {
      const archivo = leerArchivoPorFecha(fecha);
      if (archivo) {
        todasLasNoticias.push(...archivo.noticias);
      }
    }

    const herramientas = obtenerTodasHerramientas();

    return NextResponse.json({
      noticias: todasLasNoticias,
      herramientas,
    });
  } catch (error) {
    return NextResponse.json({ noticias: [], herramientas: [] }, { status: 500 });
  }
}
