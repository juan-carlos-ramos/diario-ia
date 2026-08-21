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
  // Campos enriquecidos con IA (Fase 2)
  puntosClave?: string[];
  porQueImporta?: string;
  tags?: string[];
  tiempoLecturaMin?: number;
}

/**
 * Calcula el tiempo estimado de lectura en minutos a partir de un texto
 */
export function calcularTiempoLectura(texto: string, palabrasPorMinuto = 200): number {
  if (!texto) return 1;
  const palabras = texto.trim().split(/\s+/).length;
  const minutos = Math.ceil(palabras / palabrasPorMinuto);
  return Math.max(1, minutos);
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

// Busca una noticia específica por su ID en todos los archivos del historial
export function buscarNoticiaPorId(id: string): Noticia | null {
  const fechas = listarFechasDisponibles();
  for (const fecha of fechas) {
    const archivo = leerArchivoPorFecha(fecha);
    if (!archivo) continue;
    const noticia = archivo.noticias.find((n) => n.id === id);
    if (noticia) return noticia;
  }
  return null;
}

// Genera un slug legible a partir del título de la noticia
export function generarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}
