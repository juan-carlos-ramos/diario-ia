/**
 * Utilidades puras de texto.
 */

const FINALES_VALIDOS = /[.!?…"»)”’]$/;
// Fin de oración: puntuación (+ cierres opcionales) seguida de espacio.
const FIN_DE_ORACION = /[.!?…]["»)”’]*(?=\s)/g;
const SIGNOS_SUELTOS_FINALES = /[\s,;:\-–—]+$/u;
const PALABRAS_HUERFANAS_FINALES =
  /(?:^|[\s,;:\-–—]+)(?:y|e|o|u|de|del|a|al|con|en|por|para|la|el|los|las|un|una|unos|unas|lo|que|se|su|sus|ni|sin|pero|sino|hacia|hasta|desde|entre|sobre|tras)$/iu;

/**
 * Retira signos de puntuación sueltos y conectores/preposiciones/artículos huérfanos
 * al final de una cadena incompleta antes de colocar la elipsis.
 */
export function limpiarFinalIncompleto(texto: string): string {
  let actual = String(texto ?? "").replace(SIGNOS_SUELTOS_FINALES, "");
  while (actual.length > 0) {
    const sinHuerfana = actual.replace(PALABRAS_HUERFANAS_FINALES, "");
    if (sinHuerfana === actual) break;
    actual = sinHuerfana.replace(SIGNOS_SUELTOS_FINALES, "");
  }
  return actual;
}

/**
 * Devuelve un resumen sin cortes a mitad de palabra.
 *
 * - Si el texto ya termina en `.`, `!`, `?`, `…`, `"`, `»` o `)`, se devuelve intacto.
 * - Si parece cortado: retrocede hasta el final de la última oración completa
 *   (sin añadir elipsis, porque ya es una frase cerrada) o, si no hay ninguna,
 *   hasta la última palabra completa, quita signos sueltos y conectores huérfanos,
 *   y añade `…`.
 */
export function recortarResumenLimpio(texto: string): string {
  const base = (texto ?? "").trim();
  if (!base) return "";
  if (FINALES_VALIDOS.test(base)) return base;

  let finOracion = -1;
  for (const coincidencia of base.matchAll(FIN_DE_ORACION)) {
    finOracion = coincidencia.index + coincidencia[0].length;
  }
  if (finOracion > 0) return base.slice(0, finOracion).trim();

  const ultimoEspacio = base.search(/\s\S*$/);
  const hastaPalabra = ultimoEspacio > 0 ? base.slice(0, ultimoEspacio) : base;
  const limpio = limpiarFinalIncompleto(hastaPalabra);
  return limpio ? `${limpio}…` : "";
}
