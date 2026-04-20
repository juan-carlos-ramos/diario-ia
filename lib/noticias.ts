// Funciones para leer los archivos de noticias desde el filesystem
import fs from "fs";
import path from "path";

export interface Noticia {
  id: string;
  titulo: string;
  resumen: string;
  url: string;
  imagen: string | null;
  fuente: string;
  categoria: string;
  fechaPublicacion: string;
  fechaAgregada: string;
}

export interface ArchivoNoticias {
  fecha: string;
  generado: string;
  total: number;
  noticias: Noticia[];
}

/**
 * Obtiene las noticias del día actual
 */
export function obtenerNoticiasDeHoy(): ArchivoNoticias | null {
  const hoy = new Date().toISOString().split("T")[0];
  return leerArchivoPorFecha(hoy);
}

/**
 * Obtiene las noticias de una fecha específica (formato YYYY-MM-DD)
 */
export function leerArchivoPorFecha(fecha: string): ArchivoNoticias | null {
  const archivo = path.join(process.cwd(), "data", "noticias", `${fecha}.json`);
  if (!fs.existsSync(archivo)) return null;
  try {
    const contenido = fs.readFileSync(archivo, "utf-8");
    return JSON.parse(contenido) as ArchivoNoticias;
  } catch (error) {
    console.error(`Error al leer el archivo de noticias para ${fecha}:`, error);
    return null;
  }
}

/**
 * Lista todas las fechas disponibles en el historial (más reciente primero)
 */
export function listarFechasDisponibles(): string[] {
  const carpeta = path.join(process.cwd(), "data", "noticias");
  if (!fs.existsSync(carpeta)) return [];
  try {
    return fs
      .readdirSync(carpeta)
      .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
      .map((f) => f.replace(".json", ""))
      .sort((a, b) => b.localeCompare(a));
  } catch (error) {
    console.error("Error al listar archivos de noticias:", error);
    return [];
  }
}
