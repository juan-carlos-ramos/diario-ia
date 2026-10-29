// Script de obtención de noticias de IA en español
// Se ejecuta automáticamente cada 24 horas via GitHub Actions

import Parser from "rss-parser";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { recortarPorPalabra } from "./lib/recortar.mjs";

// Se ejecuta main() SOLO si el script se invoca directamente (node scripts/fetch-news.mjs).
// Permite importarlo en pruebas sin disparar llamadas reales ni escrituras.
const esEjecucionDirecta =
  !!process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  },
  requestOptions: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    },
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

// ⚠️ VERIFICAR: Confirmar que estos RSS feeds están activos antes de ejecutar
const FUENTES = [
  {
    nombre: "Xataka",
    url: "https://feeds.weblogssl.com/xataka2",
    categoria: "tecnologia",
  },
  {
    nombre: "Hipertextual",
    url: "https://hipertextual.com/feed",
    categoria: "tecnologia",
  },
  {
    nombre: "Genbeta",
    url: "https://feeds.weblogssl.com/genbeta",
    categoria: "productividad",
  },
  {
    nombre: "El País Tecnología",
    url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada",
    categoria: "tecnologia",
  },
  {
    nombre: "Xataka Ciencia",
    url: "https://feeds.weblogssl.com/xatakaciencia",
    categoria: "investigacion",
  },
  {
    nombre: "ADSLZone",
    url: "https://www.adslzone.net/feed/",
    categoria: "tecnologia",
  },
  {
    nombre: "RedesZone",
    url: "https://www.redeszone.net/feed/",
    categoria: "tecnologia",
  },
  {
    nombre: "HardZone",
    url: "https://hardzone.es/feed/",
    categoria: "tecnologia",
  },
  {
    nombre: "MuyComputer",
    url: "https://www.muycomputer.com/feed/",
    categoria: "tecnologia",
  },
];

// Palabras clave que DEBEN aparecer para que la noticia sea relevante
const PALABRAS_CLAVE_INCLUIR = [
  "inteligencia artificial",
  "machine learning",
  "aprendizaje automático",
  "chatgpt",
  "openai",
  "gemini",
  "claude ai",
  "anthropic",
  "llm",
  "modelo de lenguaje",
  "large language model",
  "deep learning",
  "red neuronal",
  "neural network",
  "gpt-4",
  "gpt-5",
  "copilot ia",
  "midjourney",
  "stable diffusion",
  "dall-e",
  "vibe coding",
  "automatización con ia",
  "ia generativa",
  "inteligencia artificial generativa",
  "google ai",
  "microsoft ia",
  "meta ia",
  "apple ia",
  "nvidia ia",
  "robot ia",
  "agente ia",
  "ai agent",
];

// Palabras clave que EXCLUYEN la noticia aunque pase el filtro anterior
const PALABRAS_CLAVE_EXCLUIR = [
  "dc comics",
  "marvel",
  "película",
  "estreno",
  "taquilla",
  "serie de tv",
  "temporada",
  "actor",
  "actriz",
  "fútbol",
  "baloncesto",
  "nba",
  "liga",
  "champions",
  "receta",
  "cocina",
  "moda",
  "belleza",
  "horóscopo",
  "coches",
  "motor",
  "viaje",
  "turismo",
  "inmobiliaria",
  "hipoteca",
];

// Tope editorial diario de noticias a procesar y enriquecer.
// Protege contra rate limits de Gemini (4.5s/noticia) y previene timeouts en GitHub Actions.
const MAX_NOTICIAS_DIARIAS = 14;

/**
 * Aplica el tope editorial a las noticias detectadas, ordenadas previamente por frescura.
 * Garantiza que no se sobrepase el límite diario para enriquecimiento y publicación.
 *
 * @param {Array} noticias - Noticias filtradas y ordenadas por fecha.
 * @param {number} [max=MAX_NOTICIAS_DIARIAS] - Tope máximo de noticias.
 * @returns {Array} Lista acotada al tope editorial.
 */
function aplicarTopeEditorial(noticias, max = MAX_NOTICIAS_DIARIAS) {
  if (!Array.isArray(noticias)) return [];
  const total = noticias.length;
  if (total > max) {
    const seleccionadas = noticias.slice(0, max);
    console.log(
      `[Editorial] Detectadas ${total} noticias. Aplicando tope editorial: seleccionadas las ${seleccionadas.length} noticias más relevantes del día por frescura.`,
    );
    return seleccionadas;
  }
  console.log(
    `[Editorial] Seleccionadas las ${total} noticias más relevantes del día.`,
  );
  return noticias;
}

function esRelevante(titulo, resumen) {
  const texto = `${titulo} ${resumen}`.toLowerCase();

  // Verificar que tenga al menos una palabra clave de inclusión
  const tieneIncluida = PALABRAS_CLAVE_INCLUIR.some((palabra) =>
    texto.includes(palabra.toLowerCase())
  );

  if (!tieneIncluida) return false;

  // Verificar que NO tenga palabras de exclusión
  const tieneExcluida = PALABRAS_CLAVE_EXCLUIR.some((palabra) =>
    texto.includes(palabra.toLowerCase())
  );

  return !tieneExcluida;
}

function esUrlHttpValida(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function extraerImagen(item) {
  // Intento 1: campos media estándar
  if (esUrlHttpValida(item.mediaContent?.$.url)) return item.mediaContent.$.url;
  if (esUrlHttpValida(item.mediaThumbnail?.$.url)) return item.mediaThumbnail.$.url;
  if (
    esUrlHttpValida(item.enclosure?.url) &&
    item.enclosure.type?.startsWith("image/")
  )
    return item.enclosure.url;
  if (esUrlHttpValida(item.itunes?.image)) return item.itunes.image;

  // Intento 2: buscar <img> en el contenido HTML del artículo
  const contenidoHTML =
    item["content:encoded"] || item.content || item.summary || "";
  if (contenidoHTML) {
    const match = contenidoHTML.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1] && esUrlHttpValida(match[1])) return match[1];
  }

  // Intento 3: imagen genérica por categoría desde Picsum (siempre disponible, gratis)
  const semilla = Math.floor(Math.random() * 500);
  return `https://picsum.photos/seed/${semilla}/800/450`;
}

// Función auxiliar para agregar timeout a cualquier promesa
function promiseTimeout(promise, ms, nombreTarea = "Operación") {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout superado: ${nombreTarea} tardó más de ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// Fetch con AbortController para evitar que se quede colgado en peticiones HTTP
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 10000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function obtenerNoticias() {
  const todasLasNoticias = [];

  for (const fuente of FUENTES) {
    try {
      console.log(`Obteniendo noticias de ${fuente.nombre}...`);
      // Límite de 15 segundos por fuente RSS
      const feed = await promiseTimeout(parser.parseURL(fuente.url), 15000, `Lectura de ${fuente.nombre}`);

      for (const item of feed.items || []) {
        const titulo = item.title || "";
        const resumen = item.contentSnippet || item.summary || "";

        if (!esRelevante(titulo, resumen)) continue;

        todasLasNoticias.push({
          id: uuidv4(),
          titulo: titulo.trim(),
          resumen: recortarPorPalabra(resumen, 300),
          url: esUrlHttpValida(item.link) ? item.link.trim() : "https://diario-ia.vercel.app",
          imagen: extraerImagen(item),
          fuente: fuente.nombre,
          categoria: fuente.categoria,
          fechaPublicacion: item.isoDate || new Date().toISOString(),
          fechaAgregada: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error al obtener ${fuente.nombre}:`, error.message);
    }
  }

  // Eliminar duplicados por URL
  const unicas = todasLasNoticias.filter(
    (noticia, index, self) =>
      index === self.findIndex((n) => n.url === noticia.url),
  );

  // Ordenar por fecha de publicación (más reciente primero)
  unicas.sort(
    (a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion),
  );

  return unicas;
}

async function guardarNoticias(noticias) {
  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const carpeta = path.join(process.cwd(), "data", "noticias");
  const archivo = path.join(carpeta, `${hoy}.json`);

  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }

  const enriquecidasConIA = noticias.filter(
    (n) => n.enriquecidoConIA === true,
  ).length;

  const contenido = {
    fecha: hoy,
    generado: new Date().toISOString(),
    total: noticias.length,
    enriquecidasConIA,
    noticias,
  };

  fs.writeFileSync(archivo, JSON.stringify(contenido, null, 2), "utf-8");
  console.log(
    `✅ ${noticias.length} noticias guardadas en ${archivo} (${enriquecidasConIA} con IA).`,
  );
  return noticias;
}

// Regex de fecha válida. Mismo contrato anti path-traversal que usa lib/noticias.ts
// (leerArchivoPorFecha). Evita que un valor como "../../etc/passwd" escape la carpeta.
const RE_FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

// Plantillas de `porQueImporta` genéricas que delatan un enriquecimiento NO editorial.
// Provienen del default del camino IA y del texto del fallback local (enriquecerFallback).
const RE_PORQUE_GENERICO =
  /^(Novedad relevante( en el sector de la inteligencia artificial)? reportada por .+\.|«.+» según .+: análisis en profundidad pendiente de síntesis editorial\.)$/;

// Detecta si una noticia quedó sin enriquecimiento editorial real (cayó al fallback)
// por cualquiera de sus huellas: flag explícito, ausencia o texto genérico.
function esEnriquecimientoGenerico(noticia) {
  if (!noticia || typeof noticia !== "object") return false;
  if (noticia.enriquecidoConIA === false) return true;
  const porQue = (noticia.porQueImporta || "").trim();
  if (!porQue) return true;
  return RE_PORQUE_GENERICO.test(porQue);
}

// Fusiona la noticia original con el resultado del enriquecimiento reemplazando
// ÚNICAMENTE los campos derivados. Preserva intacto id/titulo/resumen/url/imagen/
// fuente/categoria/fechaPublicacion/fechaAgregada (y cualquier otro campo no derivado).
function fusionarEnriquecimiento(original, enriquecida) {
  return {
    ...original,
    puntosClave: enriquecida.puntosClave,
    porQueImporta: enriquecida.porQueImporta,
    tags: enriquecida.tags,
    tiempoLecturaMin: enriquecida.tiempoLecturaMin,
    enriquecidoConIA: enriquecida.enriquecidoConIA,
  };
}

// Re-enriquece ediciones PASADAS ya guardadas en data/noticias/<fecha>.json.
// No descarga RSS: reutiliza el motor existente (enriquecerNoticias → mismo pacing
// de 4.5s y mismo resumen de observabilidad `🧠 IA: X/Y`).
// - dryRun: solo planifica y reporta (no llama a la API, no escribe, no exige clave).
// - Escritura atómica: temporal `<fecha>.json.tmp` + rename (nunca deja JSON a medias).
// Devuelve true si todo fue correcto.
async function reenriquecerEdiciones(fechas, { dryRun = false } = {}) {
  const carpeta = path.join(process.cwd(), "data", "noticias");

  // 1) Validación estricta de fechas (anti path-traversal)
  const fechasValidas = [];
  for (const fechaRaw of fechas) {
    const fecha = (fechaRaw || "").trim();
    if (!RE_FECHA_VALIDA.test(fecha)) {
      console.error(
        `❌ Fecha inválida «${fechaRaw}». Formato requerido: YYYY-MM-DD.`,
      );
      continue;
    }
    fechasValidas.push(fecha);
  }
  if (fechasValidas.length === 0) {
    console.error("❌ No hay fechas válidas para re-enriquecer.");
    return false;
  }

  // 2) Guard de clave: re-enriquecer EXIGE IA real. Sin clave no tiene sentido:
  //    caer en silencio al fallback fabricaría una falsa apariencia de mejora.
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!dryRun && !apiKey) {
    console.error("❌ GEMINI_API_KEY no está configurada.");
    console.error(
      "   Re-enriquecer exige IA real: sin clave el proceso no aporta valor y se rechaza.",
    );
    console.error(
      "   Define GEMINI_API_KEY o usa --dry-run para ver el plan sin llamar a la API.",
    );
    return false;
  }

  let huboErrores = false;

  for (const fecha of fechasValidas) {
    const archivo = path.join(carpeta, `${fecha}.json`);
    if (!fs.existsSync(archivo)) {
      console.warn(`⚠️ No existe ${archivo}. Se omite.`);
      huboErrores = true;
      continue;
    }

    let contenido;
    try {
      contenido = JSON.parse(fs.readFileSync(archivo, "utf-8"));
    } catch (e) {
      console.error(`❌ JSON ilegible en ${archivo}: ${e.message}. Se omite.`);
      huboErrores = true;
      continue;
    }

    const noticias = Array.isArray(contenido.noticias) ? contenido.noticias : [];
    const enFallback = noticias.filter(esEnriquecimientoGenerico).length;

    if (dryRun) {
      console.log(
        `🧪 [DRY-RUN] ${fecha}: ${noticias.length} noticias, ${enFallback} en fallback → se re-enriquecerían ${noticias.length}.`,
      );
      continue;
    }

    if (noticias.length === 0) {
      console.warn(`⚠️ ${fecha}: sin noticias para re-enriquecer. Se omite.`);
      continue;
    }

    console.log(
      `♻️ Re-enriqueciendo ${fecha}: ${noticias.length} noticias (${enFallback} en fallback).`,
    );
    // Reutiliza el motor y su pacing/observabilidad. NO duplicamos lógica de IA.
    const enriquecidas = await enriquecerNoticias(noticias);

    const noticiasFinales = noticias.map((original, i) =>
      fusionarEnriquecimiento(original, enriquecidas[i] ?? original),
    );

    const enriquecidasConIA = noticiasFinales.filter(
      (n) => n.enriquecidoConIA === true,
    ).length;

    const salida = {
      ...contenido,
      fecha,
      generado: new Date().toISOString(),
      total: noticiasFinales.length,
      enriquecidasConIA,
      noticias: noticiasFinales,
    };

    // Escritura atómica: primero el temporal, luego rename (no corrompe el JSON).
    const tmp = `${archivo}.tmp`;
    try {
      fs.writeFileSync(tmp, JSON.stringify(salida, null, 2), "utf-8");
      fs.renameSync(tmp, archivo);
      console.log(
        `✅ ${fecha} actualizada: ${enriquecidasConIA}/${noticiasFinales.length} con IA.`,
      );
    } catch (e) {
      console.error(`❌ Error escribiendo ${archivo}: ${e.message}`);
      try {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      } catch {
        /* limpieza best-effort */
      }
      huboErrores = true;
    }
  }

  if (dryRun) {
    console.log(
      "🧪 DRY-RUN completado. No se llamó a la API ni se escribió ningún archivo.",
    );
  }
  return !huboErrores;
}

// Ruta del archivo que registra los IDs ya enviados a Telegram
const ARCHIVO_ENVIADOS = path.join(process.cwd(), "data", "telegram-enviados.json");

// Carga los IDs de noticias ya enviadas a Telegram
function cargarEnviados() {
  if (!fs.existsSync(ARCHIVO_ENVIADOS)) return new Set();
  try {
    const contenido = fs.readFileSync(ARCHIVO_ENVIADOS, "utf-8");
    const datos = JSON.parse(contenido);
    return new Set(datos.ids || []);
  } catch (err) {
    console.error("Error al cargar telegram-enviados.json:", err.message);
    return new Set();
  }
}

// Guarda los IDs enviados actualizados
function guardarEnviados(ids) {
  const datos = { 
    actualizado: new Date().toISOString(),
    ids: Array.from(ids)
  };
  fs.writeFileSync(ARCHIVO_ENVIADOS, JSON.stringify(datos, null, 2), "utf-8");
}

// Escapa texto para HTML de Telegram para evitar que rompa la API
function escaparHTML(texto) {
  if (!texto) return "";
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function obtenerBadgeCategoria(categoria) {
  switch (categoria?.toLowerCase()) {
    case "productividad":
      return "⚡ PRODUCTIVIDAD & VIBE CODING";
    case "investigacion":
      return "🔬 INVESTIGACIÓN & MODELOS";
    case "tecnologia":
    default:
      return "🤖 INTELIGENCIA ARTIFICIAL";
  }
}

// Genera tags locales básicos a partir del texto cuando no hay IA
function generarTagsLocales(titulo, resumen) {
  const texto = `${titulo} ${resumen}`.toLowerCase();
  const tags = new Set();

  const mapa = {
    "openai": "OpenAI",
    "chatgpt": "ChatGPT",
    "gpt-5": "GPT-5",
    "gpt-4": "GPT-4",
    "claude": "Claude",
    "anthropic": "Anthropic",
    "gemini": "Gemini",
    "google": "Google AI",
    "deepseek": "DeepSeek",
    "cursor": "Cursor",
    "lovable": "Lovable",
    "bolt": "Bolt.new",
    "v0": "v0 by Vercel",
    "perplexity": "Perplexity",
    "qwen": "Qwen",
    "mistral": "Mistral",
    "llama": "Llama",
    "midjourney": "Midjourney",
    "elevenlabs": "ElevenLabs",
    "runway": "Runway",
    "ollama": "Ollama",
    "microsoft": "Microsoft",
    "copilot": "Copilot",
    "nvidia": "NVIDIA",
    "meta": "Meta IA",
    "vibe coding": "Vibe Coding",
    "llm": "LLMs",
    "robot": "Robótica",
    "apple": "Apple IA",
    "open source": "Open Source",
  };

  for (const [clave, tag] of Object.entries(mapa)) {
    if (texto.includes(clave)) {
      tags.add(tag);
    }
  }

  if (tags.size === 0) tags.add("Inteligencia Artificial");
  return Array.from(tags).slice(0, 4);
}

// Extrae y parsea un JSON limpio incluso si viene envuelto en markdown
function extraerJSONValido(texto) {
  if (!texto) return null;
  let limpio = texto
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const primerBrace = limpio.indexOf("{");
  const ultimoBrace = limpio.lastIndexOf("}");
  if (primerBrace !== -1 && ultimoBrace !== -1) {
    limpio = limpio.slice(primerBrace, ultimoBrace + 1);
  }

  try {
    return JSON.parse(limpio);
  } catch (e) {
    console.warn("Error parseando JSON de IA:", e.message);
    return null;
  }
}

// Deriva LOCALMENTE hasta 3 viñetas cortas a partir de las oraciones del resumen.
// Garantiza que el resultado NUNCA sea idéntico al resumen completo (contrato de UI).
function derivarPuntosClaveLocales(resumen) {
  const texto = (resumen || "").replace(/\s+/g, " ").trim();
  if (!texto) return [];

  const recortar = (s) =>
    recortarPorPalabra(s, 140);

  let fragmentos = texto
    .split(/(?<=[.!?…])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);

  // Si todo el resumen es una única oración, subdividir por pausas internas
  if (fragmentos.length === 1) {
    const porPausas = fragmentos[0]
      .split(/[,;:]\s+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 12);
    if (porPausas.length > 1) fragmentos = porPausas;
  }

  let puntos = fragmentos.slice(0, 3).map(recortar);

  // Garantía dura: jamás devolver un único punto idéntico al resumen completo
  if (puntos.length === 1 && puntos[0] === texto) {
    const recortado = recortarPorPalabra(texto, 120);
    puntos = [recortado === texto ? texto.slice(0, 120).trimEnd() + "…" : recortado];
  }

  return puntos.filter(Boolean);
}

// Fallback de enriquecimiento local sin llamada a API
function enriquecerFallback(noticia) {
  const palabras = (noticia.resumen || "").split(/\s+/).length;
  const tiempoLecturaMin = Math.max(1, Math.ceil(palabras / 200));
  const tags = generarTagsLocales(noticia.titulo, noticia.resumen);
  const puntosClave = derivarPuntosClaveLocales(noticia.resumen);
  const tituloCorto = recortarPorPalabra(noticia.titulo || "", 80);

  return {
    ...noticia,
    puntosClave:
      puntosClave.length > 0 ? puntosClave : [noticia.titulo.trim()],
    porQueImporta:
      `«${tituloCorto}» según ${noticia.fuente}: análisis en profundidad ` +
      `pendiente de síntesis editorial.`,
    tags,
    tiempoLecturaMin,
    enriquecidoConIA: false,
  };
}

// Modelos vivos de Gemini. 3.8 es el principal (GA); 3.6 el fallback real.
// NO incluir 3.5: está deprecado y enruta en silencio a 3.6 (falso fallback).
const MODELOS_GEMINI = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
];

// Intentos máximos por modelo ante errores transitorios (429 / 5xx / red)
const MAX_INTENTOS_MODELO = 4;

// Umbral de noticias CONSECUTIVAS en las que TODOS los intentos de TODOS los
// modelos fallan por causa de 429. Al alcanzarlo se asume CUOTA AGOTADA (no un
// rate limit transitorio) y se aborta el enriquecimiento: la cuota agotada no se
// recupera en segundos, así que reintentar solo desperdicia tiempo y riesgo de
// sobrescribir una edición buena con datos de fallback.
const UMBRAL_429_CONSECUTIVOS = 3;

// Error tipado que señala cuota agotada. Permite distinguir este caso (abortar)
// de un fallo local recuperable (fallback puntual).
class ErrorCuotaAgotada extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorCuotaAgotada";
  }
}

// Calcula la espera de backoff exponencial respetando el header Retry-After.
// 429/5xx → 2s, 4s, 8s, 16s (tope 30s). Retry-After tiene prioridad si existe.
function calcularEsperaBackoff(res, intento) {
  const retryAfter = res?.headers?.get?.("retry-after");
  if (retryAfter) {
    const segundos = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(segundos) && segundos > 0) {
      return Math.min(segundos, 60) * 1000;
    }
  }
  const base = 2000;
  return Math.min(base * 2 ** (intento - 1), 30000);
}

// Enriquecer una noticia individual con Google Gemini Flash.
// Devuelve la noticia con `enriquecidoConIA: true` en éxito o el fallback local.
async function enriquecerConGemini(noticia, rawApiKey, opciones = {}) {
  // Permite inyectar una función de espera propia (tests: 0ms). Reutiliza la real por defecto.
  const calcularEspera = opciones.calcularEsperaBackoff || calcularEsperaBackoff;
  const apiKey = (rawApiKey || "").trim();
  if (!apiKey) return { noticia: enriquecerFallback(noticia), cuotaAgotada: false };

  const prompt = `Eres un periodista tecnológico y redactor jefe para el portal de noticias de Inteligencia Artificial "DiarioIA".
Analiza la siguiente noticia y genera un micro-análisis exclusivo, inteligente y original.

Noticia:
- Título: ${noticia.titulo}
- Fuente original: ${noticia.fuente}
- Texto base: ${noticia.resumen}

INSTRUCCIONES OBLIGATORIAS:
1. "puntosClave": Genera exactamente 3 viñetas concisas redactadas por ti con tus propias palabras (máximo 1-2 líneas cada una) sintetizando los datos y hechos clave. NUNCA repitas el texto base literal.
2. "porQueImporta": Redacta un párrafo único (2-3 líneas) explicando el impacto real que esta noticia específica tiene para programadores, empresas o la industria. NUNCA uses frases genéricas repetitivas.
3. "tags": Genera de 2 a 4 etiquetas temáticas relevantes (ej: ["OpenAI", "Robótica", "LLMs", "Hardware", "Productividad"]).

Responde ÚNICAMENTE con este JSON:
{
  "puntosClave": [
    "Primer punto clave sintetizado.",
    "Segundo punto clave con datos o detalles.",
    "Tercer punto con el resultado o proyección."
  ],
  "porQueImporta": "Explicación del impacto para la tecnología y la IA...",
  "tags": ["Tag1", "Tag2"]
}`;

  // La clave viaja SIEMPRE en el header, nunca en la URL (evita filtrarla en logs)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/PLACEHOLDER:generateContent`;

  // Rastrea si TODOS los modelos se descartaron EXCLUSIVAMENTE por 429.
  // Solo entonces se declara cuota agotada (un 404/red/JSON en medio lo desmiente).
  let todosLosModelosPor429 = true;

  for (const modelo of MODELOS_GEMINI) {
    const endpoint = url.replace("PLACEHOLDER", modelo);
    let motivoSalto = "agotó sus intentos";
    let modeloPor429 = true;

    for (let intento = 1; intento <= MAX_INTENTOS_MODELO; intento++) {
      let res;
      try {
        res = await fetchWithTimeout(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              thinkingConfig: {
                thinkingLevel: "LOW",
              },
            },
          }),
          timeout: 25000,
        });
      } catch (err) {
        // Timeout / error de red → reintentar; si se agotan, saltar al siguiente modelo
        console.warn(
          `⚠️ ${modelo} (intento ${intento}/${MAX_INTENTOS_MODELO}) error de red/timeout: ${err.message}`,
        );
        motivoSalto = "error de red persistente";
        modeloPor429 = false;
        if (intento < MAX_INTENTOS_MODELO) {
          await new Promise((r) => setTimeout(r, calcularEspera(null, intento)));
        }
        continue;
      }

      // 404 / modelo apagado → NO reintentar; saltar al siguiente modelo del array
      if (res.status === 404) {
        const errBody = await res.text().catch(() => "");
        console.warn(
          `🛑 ${modelo} no disponible (404 model_not_found). Siguiente modelo. ${errBody.slice(0, 120)}`,
        );
        motivoSalto = "modelo no encontrado (404)";
        modeloPor429 = false;
        break;
      }

      // 429 / rate limit → backoff exponencial real, respetando Retry-After
      if (res.status === 429) {
        const espera = calcularEspera(res, intento);
        console.warn(
          `⏳ ${modelo} rate limit 429 (intento ${intento}/${MAX_INTENTOS_MODELO}). Esperando ${(espera / 1000).toFixed(1)}s...`,
        );
        motivoSalto = "rate limit 429 persistente";
        if (intento < MAX_INTENTOS_MODELO) {
          await new Promise((r) => setTimeout(r, espera));
        }
        continue;
      }

      // 5xx → reintentar con backoff
      if (res.status >= 500) {
        const espera = calcularEspera(res, intento);
        console.warn(
          `🔥 ${modelo} error servidor ${res.status} (intento ${intento}/${MAX_INTENTOS_MODELO}). Reintentando en ${(espera / 1000).toFixed(1)}s...`,
        );
        motivoSalto = `error servidor ${res.status} persistente`;
        modeloPor429 = false;
        if (intento < MAX_INTENTOS_MODELO) {
          await new Promise((r) => setTimeout(r, espera));
        }
        continue;
      }

      // Otros 4xx (p. ej. 400 por config inválida) → saltar al siguiente modelo
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.warn(
          `⚠️ ${modelo} retornó HTTP ${res.status}. Siguiente modelo. ${errBody.slice(0, 120)}`,
        );
        motivoSalto = `HTTP ${res.status}`;
        modeloPor429 = false;
        break;
      }

      // 200 → intentar extraer JSON válido
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.warn(
          `⚠️ ${modelo} respuesta 200 con JSON ilegible: ${jsonErr.message}. Siguiente modelo.`,
        );
        motivoSalto = "JSON de respuesta ilegible";
        modeloPor429 = false;
        break;
      }

      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText || !candidateText.trim()) {
        console.warn(
          `⚠️ ${modelo} respuesta 200 sin contenido utilizable. Siguiente modelo.`,
        );
        motivoSalto = "respuesta vacía";
        modeloPor429 = false;
        break;
      }

      const parsed = extraerJSONValido(candidateText);
      if (!parsed) {
        console.warn(
          `⚠️ ${modelo} JSON irrecuperable en la respuesta. Siguiente modelo.`,
        );
        motivoSalto = "JSON irrecuperable";
        modeloPor429 = false;
        break;
      }

      const palabras = (noticia.resumen || "").split(/\s+/).length;
      const puntosIA =
        Array.isArray(parsed.puntosClave) && parsed.puntosClave.length > 0
          ? parsed.puntosClave
          : derivarPuntosClaveLocales(noticia.resumen);

      return {
        noticia: {
          ...noticia,
          puntosClave: puntosIA,
          porQueImporta:
            parsed.porQueImporta || `Novedad relevante reportada por ${noticia.fuente}.`,
          tags:
            Array.isArray(parsed.tags) && parsed.tags.length > 0
              ? parsed.tags
              : generarTagsLocales(noticia.titulo, noticia.resumen),
          tiempoLecturaMin: Math.max(1, Math.ceil(palabras / 200)),
          enriquecidoConIA: true,
        },
        cuotaAgotada: false,
      };
    }

    console.warn(`➡️ Descartando ${modelo}: ${motivoSalto}.`);
    todosLosModelosPor429 = todosLosModelosPor429 && modeloPor429;
  }

  console.warn(
    `🆘 Todos los modelos fallaron para «${noticia.titulo.slice(0, 45)}…». Aplicando fallback local.`,
  );
  return { noticia: enriquecerFallback(noticia), cuotaAgotada: todosLosModelosPor429 };
}

// Procesa la lista completa de noticias con IA respetando cuotas de 15 RPM.
// Guardián de cuota: si N noticias CONSECUTIVAS agotan TODOS los intentos de
// TODOS los modelos por 429, se asume cuota agotada y se ABORTA (throw) sin
// escribir nada. Un éxito resetea el contador (un 429 aislado no aborta).
// `opciones` permite inyectar pacing/espera en pruebas (pausaMs, calcularEsperaBackoff).
async function enriquecerNoticias(noticias, opciones = {}) {
  const pausaMs = opciones.pausaMs ?? 4500;
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = (rawKey || "").trim();

  if (!apiKey) {
    console.log("ℹ️ GEMINI_API_KEY no configurada. Aplicando enriquecimiento algorítmico local.");
    const locales = noticias.map(enriquecerFallback);
    console.log(
      `🧠 IA: 0/${locales.length} noticias enriquecidas; ${locales.length} cayeron al fallback (sin API key).`,
    );
    return locales;
  }

  console.log(`🧠 GEMINI_API_KEY detectada. Enriqueciendo ${noticias.length} noticias con espaciado de 4.5s...`);
  const enriquecidas = [];
  let fallos429Consecutivos = 0;

  for (let i = 0; i < noticias.length; i++) {
    const noticia = noticias[i];
    console.log(`✨ [${i + 1}/${noticias.length}] Procesando con IA: ${noticia.titulo.slice(0, 45)}...`);
    const { noticia: enriquecida, cuotaAgotada } = await enriquecerConGemini(
      noticia,
      apiKey,
      opciones,
    );
    enriquecidas.push(enriquecida);

    if (enriquecida.enriquecidoConIA === true) {
      // Un éxito (aunque sea tardío) demuestra que la cuota NO está agotada.
      fallos429Consecutivos = 0;
    } else if (cuotaAgotada) {
      fallos429Consecutivos += 1;
      if (fallos429Consecutivos >= UMBRAL_429_CONSECUTIVOS) {
        console.error(
          "🛑 Cuota de Gemini agotada: abortando para no desperdiciar tiempo ni sobrescribir datos con fallback.",
        );
        throw new ErrorCuotaAgotada(
          `Cuota de Gemini agotada: ${fallos429Consecutivos} noticias consecutivas con 429 persistente.`,
        );
      }
    } else {
      // Fallback por otra causa (red/404/JSON): rompe la racha de 429.
      fallos429Consecutivos = 0;
    }

    // Pausa entre llamadas para mantenerse dentro del límite gratuito de 15 RPM
    if (i < noticias.length - 1 && pausaMs > 0) {
      await new Promise((r) => setTimeout(r, pausaMs));
    }
  }

  const conIA = enriquecidas.filter((n) => n.enriquecidoConIA === true).length;
  const fallback = enriquecidas.length - conIA;
  console.log(
    `🧠 IA: ${conIA}/${enriquecidas.length} noticias enriquecidas; ${fallback} cayeron al fallback.`,
  );
  return enriquecidas;
}

// Publica solo las noticias nuevas en el canal de Telegram
async function publicarEnTelegram(noticias) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  let canal = process.env.TELEGRAM_CHANNEL;

  if (!token || !canal) {
    console.log("⚠️ Variables de Telegram no configuradas, omitiendo publicación.");
    return;
  }

  // Asegurar formato correcto de chatId (debe empezar con @ si es un canal público, o ser ID numérico)
  if (!canal.startsWith("@") && !canal.startsWith("-")) {
    canal = `@${canal}`;
  }

  const enviados = cargarEnviados();
  const nuevas = noticias.filter((n) => !enviados.has(n.id));

  if (nuevas.length === 0) {
    console.log("ℹ️ No hay noticias nuevas para enviar a Telegram.");
    return;
  }

  console.log(`📨 Enviando ${nuevas.length} noticias nuevas a Telegram...`);

  const paraPublicar = nuevas.slice(0, 10);

  for (const noticia of paraPublicar) {
    const badge = obtenerBadgeCategoria(noticia.categoria);
    const tituloEscapado = escaparHTML(noticia.titulo);
    const fuenteEscapada = escaparHTML(noticia.fuente);

    const puntos = Array.isArray(noticia.puntosClave) && noticia.puntosClave.length > 0
      ? noticia.puntosClave
      : [noticia.resumen];

    const puntosTexto = puntos.map((p) => `• ${escaparHTML(p)}`).join("\n");

    let texto = `<b>${badge}</b> · <i>DiarioIA</i>\n\n📰 <b>${tituloEscapado}</b>\n\n<blockquote>${puntosTexto}</blockquote>`;

    if (noticia.porQueImporta) {
      texto += `\n\n💡 <b>Por qué importa:</b>\n<i>${escaparHTML(noticia.porQueImporta)}</i>`;
    }

    texto += `\n\n🌐 <b>Fuente:</b> ${fuenteEscapada}`;

    if (Array.isArray(noticia.tags) && noticia.tags.length > 0) {
      const tagsTexto = noticia.tags
        .map((t) => `#${escaparHTML(t.replace(/[\s-]/g, ""))}`)
        .join(" ");
      texto += `\n🏷️ ${tagsTexto}`;
    }

    let captionTexto = texto;
    if (captionTexto.length > 950) {
      captionTexto = `<b>${badge}</b> · <i>DiarioIA</i>\n\n📰 <b>${tituloEscapado}</b>\n\n<blockquote>${puntosTexto}</blockquote>\n\n🌐 <b>Fuente:</b> ${fuenteEscapada}`;
      if (Array.isArray(noticia.tags) && noticia.tags.length > 0) {
        const tagsTexto = noticia.tags
          .map((t) => `#${escaparHTML(t.replace(/[\s-]/g, ""))}`)
          .join(" ");
        captionTexto += `\n🏷️ ${tagsTexto}`;
      }
      if (captionTexto.length > 950) {
        captionTexto = captionTexto.slice(0, 940) + "...";
      }
    }

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "🚀 Leer noticia completa en DiarioIA", url: `https://diario-ia.vercel.app/noticia/${noticia.id}` }
        ]
      ]
    };

    try {
      let url;
      let body;

      if (noticia.imagen) {
        url = `https://api.telegram.org/bot${token}/sendPhoto`;
        body = JSON.stringify({
          chat_id: canal,
          photo: noticia.imagen,
          caption: captionTexto,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        });
      } else {
        url = `https://api.telegram.org/bot${token}/sendMessage`;
        body = JSON.stringify({
          chat_id: canal,
          text: texto,
          parse_mode: "HTML",
          disable_web_page_preview: false,
          reply_markup: replyMarkup,
        });
      }

      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        timeout: 10000
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Respuesta no válida de Telegram:", jsonErr.message);
      }

      if (!data.ok) {
        // Si la imagen falla, reintenta sin imagen
        if (noticia.imagen) {
          console.log(`⚠️ Envió con imagen falló para "${noticia.titulo.slice(0, 40)}...", reintentando sin imagen: ${data.description || res.statusText}`);
          const res2 = await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: canal,
              text: texto,
              parse_mode: "HTML",
              disable_web_page_preview: false,
              reply_markup: replyMarkup,
            }),
            timeout: 10000
          });
          const data2 = await res2.json().catch(() => ({}));
          if (data2.ok) {
            enviados.add(noticia.id);
            console.log(`✅ Publicado sin imagen: ${noticia.titulo.slice(0, 50)}...`);
          } else {
            console.error(`Error publicando: ${data2.description || res2.statusText}`);
          }
        } else {
          console.error(`Error publicando en Telegram: ${data.description || res.statusText}`);
        }
      } else {
        enviados.add(noticia.id);
        const tipoEnvio = noticia.imagen ? "con imagen" : "sin imagen";
        console.log(`✅ Publicado ${tipoEnvio}: ${noticia.titulo.slice(0, 50)}...`);
      }

      await new Promise((r) => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Error enviando a Telegram: ${error.message}`);
    }
  }

  guardarEnviados(enviados);
  console.log(`💾 Registro de enviados actualizado: ${enviados.size} noticias en total.`);
}

// Carga las noticias guardadas de hoy (o la más reciente) para emisión diferida
function obtenerNoticiasGuardadasHoy() {
  const hoy = new Date().toISOString().split("T")[0];
  const archivoHoy = path.join(process.cwd(), "data", "noticias", `${hoy}.json`);
  if (fs.existsSync(archivoHoy)) {
    try {
      const data = JSON.parse(fs.readFileSync(archivoHoy, "utf-8"));
      return data.noticias || [];
    } catch (e) {
      console.error("Error leyendo archivo de hoy:", e.message);
    }
  }
  const carpeta = path.join(process.cwd(), "data", "noticias");
  if (fs.existsSync(carpeta)) {
    const archivos = fs
      .readdirSync(carpeta)
      .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
      .sort()
      .reverse();
    if (archivos.length > 0) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(carpeta, archivos[0]), "utf-8"));
        return data.noticias || [];
      } catch (e) {
        console.error("Error leyendo noticias recientes:", e.message);
      }
    }
  }
  return [];
}

// Decide si el flujo diario debe OMITIR fetch+enriquecimiento por idempotencia:
// si la edición de HOY ya existe y tiene al menos una noticia enriquecida con IA,
// re-ejecutar gastaría cuota sin aportar valor. `--force` anula la omisión.
// `carpeta` es inyectable en pruebas (por defecto data/noticias del cwd).
function debeOmitirEdicionDeHoy(hoy, { force = false, carpeta } = {}) {
  if (force) return false;
  const carpetaBase = carpeta || path.join(process.cwd(), "data", "noticias");
  const archivo = path.join(carpetaBase, `${hoy}.json`);
  if (!fs.existsSync(archivo)) return false;
  try {
    const contenido = JSON.parse(fs.readFileSync(archivo, "utf-8"));
    return Number(contenido?.enriquecidasConIA) > 0;
  } catch {
    // Archivo ilegible → no omitir; el flujo normal intentará recomponerlo.
    return false;
  }
}

// Ejecutar
async function main() {
  const args = process.argv.slice(2);
  const soloFetch = args.includes("--fetch-only");
  const soloTelegram = args.includes("--telegram-only");
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const idxReenriquecer = args.indexOf("--reenriquecer");

  // Modo re-enriquecimiento de ediciones PASADAS (tiene precedencia sobre fetch/telegram).
  if (idxReenriquecer !== -1) {
    const valor = (args[idxReenriquecer + 1] || "").trim();
    if (!valor || valor.startsWith("--")) {
      console.error(
        "❌ Falta el argumento de fechas: --reenriquecer <YYYY-MM-DD>[,<YYYY-MM-DD>...]",
      );
      process.exit(1);
    }
    const fechas = valor
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    console.log(
      `♻️ Modo re-enriquecimiento${dryRun ? " (dry-run)" : ""}: ${fechas.join(", ")}`,
    );
    const ok = await reenriquecerEdiciones(fechas, { dryRun });
    console.log(
      ok
        ? "🎉 Re-enriquecimiento finalizado con éxito."
        : "⚠️ Re-enriquecimiento finalizado con incidencias.",
    );
    process.exit(ok ? 0 : 1);
  }

  if (soloTelegram) {
    console.log("📨 Modo Telegram únicamente: cargando noticias existentes para notificar...");
    const noticias = obtenerNoticiasGuardadasHoy();
    if (noticias.length === 0) {
      console.warn("⚠️ No se encontraron noticias guardadas para publicar en Telegram.");
    } else {
      await publicarEnTelegram(noticias);
    }
    console.log("🎉 Publicación en Telegram finalizada.");
    process.exit(0);
  }

  // Guard de idempotencia: si hoy ya se generó y enriqueció, no gastar cuota de nuevo.
  const hoy = new Date().toISOString().split("T")[0];
  if (debeOmitirEdicionDeHoy(hoy, { force })) {
    console.log(
      "ℹ️ La edición de hoy ya existe y está enriquecida; omitiendo re-enriquecimiento (idempotente).",
    );
    process.exit(0);
  }

  const noticiasCrudas = await obtenerNoticias();
  const noticiasParaProcesar = aplicarTopeEditorial(noticiasCrudas);
  const noticiasEnriquecidas = await enriquecerNoticias(noticiasParaProcesar);
  await guardarNoticias(noticiasEnriquecidas);

  if (!soloFetch) {
    await publicarEnTelegram(noticiasEnriquecidas);
  } else {
    console.log("ℹ️ Modo fetch únicamente: noticias guardadas. Publicación en Telegram diferida.");
  }

  console.log("🎉 Proceso de noticias finalizado con éxito.");
  process.exit(0);
}

if (esEjecucionDirecta) {
  main().catch((err) => {
    console.error("Error fatal en script de noticias:", err);
    process.exit(1);
  });
}

// Exports para pruebas aisladas (no disparan main ni llamadas reales a la API)
export {
  MAX_NOTICIAS_DIARIAS,
  aplicarTopeEditorial,
  obtenerNoticias,
  derivarPuntosClaveLocales,
  enriquecerFallback,
  calcularEsperaBackoff,
  MODELOS_GEMINI,
  MAX_INTENTOS_MODELO,
  UMBRAL_429_CONSECUTIVOS,
  ErrorCuotaAgotada,
  enriquecerConGemini,
  enriquecerNoticias,
  debeOmitirEdicionDeHoy,
  esEnriquecimientoGenerico,
  fusionarEnriquecimiento,
  reenriquecerEdiciones,
  RE_FECHA_VALIDA,
};


