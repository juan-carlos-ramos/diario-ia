// Script de obtención de noticias de IA en español
// Se ejecuta automáticamente cada 24 horas via GitHub Actions

import Parser from "rss-parser";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

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
          resumen: resumen.slice(0, 300).trim(),
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

  const contenido = {
    fecha: hoy,
    generado: new Date().toISOString(),
    total: noticias.length,
    noticias,
  };

  fs.writeFileSync(archivo, JSON.stringify(contenido, null, 2), "utf-8");
  console.log(`✅ ${noticias.length} noticias guardadas en ${archivo}`);
  return noticias;
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

// Fallback de enriquecimiento local sin llamada a API
function enriquecerFallback(noticia) {
  const palabras = (noticia.resumen || "").split(/\s+/).length;
  const tiempoLecturaMin = Math.max(1, Math.ceil(palabras / 200));
  const tags = generarTagsLocales(noticia.titulo, noticia.resumen);

  return {
    ...noticia,
    puntosClave: [noticia.resumen],
    porQueImporta: `Novedad relevante en el sector de la inteligencia artificial reportada por ${noticia.fuente}.`,
    tags,
    tiempoLecturaMin,
  };
}

// Modelos activos y rápidos de Gemini
const MODELOS_GEMINI = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

// Enriquecer una noticia individual con Google Gemini Flash
async function enriquecerConGemini(noticia, rawApiKey) {
  const apiKey = (rawApiKey || "").trim();
  if (!apiKey) return enriquecerFallback(noticia);

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

  for (const modelo of MODELOS_GEMINI) {
    for (let intento = 1; intento <= 2; intento++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
        const res = await fetchWithTimeout(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

        if (res.status === 429) {
          console.warn(`⏳ Rate limit en ${modelo} (intento ${intento}). Esperando 6s para reintentar...`);
          await new Promise((r) => setTimeout(r, 6000));
          continue;
        }

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          console.warn(`⚠️ Modelo ${modelo} retornó error (${res.status}): ${errBody.slice(0, 100)}`);
          break;
        }

        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) break;

        const parsed = extraerJSONValido(candidateText);
        if (!parsed) break;

        const palabras = (noticia.resumen || "").split(/\s+/).length;

        return {
          ...noticia,
          puntosClave: Array.isArray(parsed.puntosClave) && parsed.puntosClave.length > 0
            ? parsed.puntosClave
            : [noticia.resumen],
          porQueImporta: parsed.porQueImporta || `Novedad relevante reportada por ${noticia.fuente}.`,
          tags: Array.isArray(parsed.tags) && parsed.tags.length > 0
            ? parsed.tags
            : generarTagsLocales(noticia.titulo, noticia.resumen),
          tiempoLecturaMin: Math.max(1, Math.ceil(palabras / 200)),
        };
      } catch (err) {
        console.warn(`⚠️ Error conectando a ${modelo}:`, err.message);
        break;
      }
    }
  }

  return enriquecerFallback(noticia);
}

// Procesa la lista completa de noticias con IA respetando cuotas de 15 RPM
async function enriquecerNoticias(noticias) {
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = (rawKey || "").trim();

  if (!apiKey) {
    console.log("ℹ️ GEMINI_API_KEY no configurada. Aplicando enriquecimiento algorítmico local.");
    return noticias.map(enriquecerFallback);
  }

  console.log(`🧠 GEMINI_API_KEY detectada. Enriqueciendo ${noticias.length} noticias con espaciado de 4.5s...`);
  const enriquecidas = [];

  for (let i = 0; i < noticias.length; i++) {
    const noticia = noticias[i];
    console.log(`✨ [${i + 1}/${noticias.length}] Procesando con IA: ${noticia.titulo.slice(0, 45)}...`);
    const enriquecida = await enriquecerConGemini(noticia, apiKey);
    enriquecidas.push(enriquecida);
    // Pausa de 4.5 segundos entre llamadas para mantenerse dentro del límite gratuito de 15 RPM
    if (i < noticias.length - 1) {
      await new Promise((r) => setTimeout(r, 4500));
    }
  }

  console.log(`✅ ${enriquecidas.length} noticias procesadas con éxito.`);
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

// Ejecutar
async function main() {
  const noticiasCrudas = await obtenerNoticias();
  const noticiasEnriquecidas = await enriquecerNoticias(noticiasCrudas);
  await guardarNoticias(noticiasEnriquecidas);
  await publicarEnTelegram(noticiasEnriquecidas);
  console.log("🎉 Proceso de noticias finalizado con éxito.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error fatal en script de noticias:", err);
  process.exit(1);
});


