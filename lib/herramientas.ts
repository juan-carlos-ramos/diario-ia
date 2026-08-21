import fs from "fs";
import path from "path";

export type CategoriaHerramienta =
  | "todos"
  | "vibe-coding"
  | "llms"
  | "productividad"
  | "imagen-video"
  | "open-source";

export interface HerramientaIA {
  id: string;
  nombre: string;
  descripcion: string;
  url: string;
  categoria: "vibe-coding" | "llms" | "productividad" | "imagen-video" | "open-source";
  icono: string;
  precio: "Gratis" | "Freemium" | "Pago" | "Open Source";
  destacado: boolean;
}

export const CATEGORIAS_HERRAMIENTAS: { id: CategoriaHerramienta; nombre: string; icono: string }[] = [
  { id: "todos", nombre: "Todas", icono: "✨" },
  { id: "vibe-coding", nombre: "Vibe Coding & Dev", icono: "💻" },
  { id: "llms", nombre: "Modelos & LLMs", icono: "🧠" },
  { id: "productividad", nombre: "Productividad", icono: "⚡" },
  { id: "imagen-video", nombre: "Imagen & Video", icono: "🎨" },
  { id: "open-source", nombre: "Open Source", icono: "🦙" },
];

/**
 * Obtiene todas las herramientas del archivo JSON
 */
export function obtenerTodasHerramientas(): HerramientaIA[] {
  const archivo = path.join(process.cwd(), "data", "herramientas.json");
  if (!fs.existsSync(archivo)) return [];
  try {
    const contenido = fs.readFileSync(archivo, "utf-8");
    return JSON.parse(contenido) as HerramientaIA[];
  } catch (error) {
    console.error("Error al leer herramientas.json:", error);
    return [];
  }
}

/**
 * Filtra herramientas por categoría
 */
export function obtenerHerramientasPorCategoria(categoria: CategoriaHerramienta): HerramientaIA[] {
  const todas = obtenerTodasHerramientas();
  if (categoria === "todos") return todas;
  return todas.filter((h) => h.categoria === categoria);
}

/**
 * Obtiene la Herramienta del Día de forma determinista rotando según la fecha
 */
export function obtenerHerramientaDelDia(fechaStr?: string): HerramientaIA {
  const todas = obtenerTodasHerramientas();
  const destacadas = todas.filter((h) => h.destacado);
  const pool = destacadas.length > 0 ? destacadas : todas;

  if (pool.length === 0) {
    return {
      id: "cursor",
      nombre: "Cursor",
      descripcion: "El editor de código impulsado por IA para Vibe Coding.",
      url: "https://cursor.com",
      categoria: "vibe-coding",
      icono: "💻",
      precio: "Freemium",
      destacado: true,
    };
  }

  const hoy = fechaStr || new Date().toISOString().split("T")[0];
  // Generar hash numérico simple a partir de la fecha YYYY-MM-DD
  const hash = hoy.split("-").reduce((acc, part) => acc * 31 + parseInt(part, 10), 0);
  const indice = Math.abs(hash) % pool.length;
  return pool[indice];
}
