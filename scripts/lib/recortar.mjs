const SIGNOS_SUELTOS_FINALES = /[\s,;:\-–—]+$/u;
const PALABRAS_HUERFANAS_FINALES =
  /(?:^|[\s,;:\-–—]+)(?:y|e|o|u|de|del|a|al|con|en|por|para|la|el|los|las|un|una|unos|unas|lo|que|se|su|sus|ni|sin|pero|sino|hacia|hasta|desde|entre|sobre|tras)$/iu;

/**
 * Retira signos de puntuación sueltos y conectores/preposiciones/artículos huérfanos
 * al final de una cadena incompleta antes de añadir elipsis.
 */
export function limpiarFinalIncompleto(texto) {
  let actual = String(texto ?? "").replace(SIGNOS_SUELTOS_FINALES, "");
  while (actual.length > 0) {
    const sinHuerfana = actual.replace(PALABRAS_HUERFANAS_FINALES, "");
    if (sinHuerfana === actual) break;
    actual = sinHuerfana.replace(SIGNOS_SUELTOS_FINALES, "");
  }
  return actual;
}

/**
 * Recorta `texto` a un máximo de `max` caracteres sin partir palabras.
 * - Normaliza espacios en blanco.
 * - Si cabe, lo devuelve intacto.
 * - Prefiere terminar en la última oración completa (. ! ?) si cae en >= 50% de `max`.
 * - Si no, retrocede al último espacio, quita signos finales sueltos y palabras huérfanas, y añade "…".
 * - Si no hay ningún espacio (palabra única más larga que `max`), corta en `max` y añade "…".
 */
export function recortarPorPalabra(texto, max = 300) {
  const limpio = String(texto ?? "").replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;

  const corte = limpio.slice(0, max);

  // 1) Última oración completa (el signo debe ir seguido de espacio o fin de texto)
  for (let i = corte.length - 1; i >= Math.ceil(max * 0.5) - 1; i--) {
    if (/[.!?]/.test(corte[i]) && (i + 1 >= limpio.length || /\s/.test(limpio[i + 1]))) {
      return corte.slice(0, i + 1);
    }
  }

  // 2) Último límite de palabra
  let base = corte;
  if (!/\s/.test(limpio[max])) {
    const ultimoEspacio = corte.lastIndexOf(" ");
    if (ultimoEspacio > 0) base = corte.slice(0, ultimoEspacio);
  }

  const sinSignos = limpiarFinalIncompleto(base);
  return (sinSignos || base.trimEnd()) + "…";
}
