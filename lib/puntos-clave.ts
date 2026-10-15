/**
 * Utilidades editoriales puras para el bloque de análisis de una noticia.
 *
 * Objetivo: blindar la vista de artículo contra el "fallback" del pipeline,
 * donde `puntosClave = [resumen]` provocaba que el resumen apareciera
 * duplicado (como punto clave y como cuerpo) y el encabezado mintiera.
 *
 * Sin estado ni efectos: 100% testeables en aislamiento.
 */

/** Normaliza un texto para comparación semántica laxa. */
export function normalizarParaComparar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detecta si un punto clave es en realidad el resumen del artículo.
 * Compara por igualdad normalizada y por contención alta (≥ 60% del texto
 * largo), de modo que variaciones triviales también se filtren. Ignora
 * puntos cortos legítimos (< 40 caracteres) para evitar falsos positivos.
 */
export function esDuplicadoDelResumen(punto: string, resumen: string): boolean {
  const p = normalizarParaComparar(punto);
  const r = normalizarParaComparar(resumen);
  if (!p || !r) return true; // texto vacío: no aporta nada como punto
  if (p === r) return true;

  const [corto, largo] = p.length <= r.length ? [p, r] : [r, p];
  if (corto.length < 40) return false;
  return largo.includes(corto) && corto.length / largo.length >= 0.6;
}

/**
 * Devuelve los puntos clave realmente informativos: descarta vacíos,
 * duplicados entre sí y cualquier punto que reproduzca el resumen.
 */
export function obtenerPuntosClaveValidos(
  puntos: string[] | undefined,
  resumen: string,
): string[] {
  if (!Array.isArray(puntos)) return [];

  const vistos = new Set<string>();
  const validos: string[] = [];

  for (const punto of puntos) {
    const limpio = typeof punto === "string" ? punto.trim() : "";
    if (!limpio || esDuplicadoDelResumen(limpio, resumen)) continue;

    const huella = normalizarParaComparar(limpio);
    if (vistos.has(huella)) continue;

    vistos.add(huella);
    validos.push(limpio);
  }

  return validos;
}

/** Encabezado honesto y dinámico según el número real de puntos. */
export function titularPuntosClave(cantidad: number): string {
  if (cantidad <= 1) return "Punto clave";
  if (cantidad === 2) return "En 2 puntos clave";
  return `En ${cantidad} puntos clave`;
}

/**
 * Rótulo de relleno que el pipeline genera cuando no hay análisis real.
 * Muy conservador para no descartar contenido legítimo.
 */
export const PATRON_POR_QUE_IMPORTA_GENERICO =
  /novedad relevante en el sector de la inteligencia artificial reportada por/i;

/** ¿El "¿Por qué importa?" aporta criterio real o es relleno de plantilla? */
export function esPorQueImportaSignificativo(texto: string | undefined): boolean {
  if (!texto || !texto.trim()) return false;
  return !PATRON_POR_QUE_IMPORTA_GENERICO.test(texto);
}
