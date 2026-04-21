// Script de obtención de noticias de IA en español
// Se ejecuta automáticamente cada 24 horas via GitHub Actions

import Parser from "rss-parser";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const parser = new Parser({
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
];

// Palabras clave para filtrar noticias relevantes
const PALABRAS_CLAVE = [
  "inteligencia artificial",
  "ia ",
  " ia,",
  "machine learning",
  "chatgpt",
  "openai",
  "gemini",
  "claude",
  "llm",
  "modelo de lenguaje",
  "automatización",
  "vibe coding",
  "copilot",
  "midjourney",
  "stable diffusion",
  "deep learning",
  "neural",
  "gpt",
  "anthropic",
  "google ai",
  "microsoft ai",
];

function esRelevante(titulo, resumen) {
  const texto = `${titulo} ${resumen}`.toLowerCase();
  return PALABRAS_CLAVE.some((palabra) =>
    texto.includes(palabra.toLowerCase()),
  );
}

function extraerImagen(item) {
  // Intento 1: campos media estándar
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
  if (
    item.enclosure?.url &&
    item.enclosure.type?.startsWith("image/")
  )
    return item.enclosure.url;
  if (item.itunes?.image) return item.itunes.image;

  // Intento 2: buscar <img> en el contenido HTML del artículo
  const contenidoHTML =
    item["content:encoded"] || item.content || item.summary || "";
  if (contenidoHTML) {
    const match = contenidoHTML.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1] && match[1].startsWith("http")) return match[1];
  }

  // Intento 3: imagen genérica por categoría desde Picsum (siempre disponible, gratis)
  const semilla = Math.floor(Math.random() * 500);
  return `https://picsum.photos/seed/${semilla}/800/450`;
}

async function obtenerNoticias() {
  const todasLasNoticias = [];

  for (const fuente of FUENTES) {
    try {
      console.log(`Obteniendo noticias de ${fuente.nombre}...`);
      const feed = await parser.parseURL(fuente.url);

      for (const item of feed.items) {
        const titulo = item.title || "";
        const resumen = item.contentSnippet || item.summary || "";

        if (!esRelevante(titulo, resumen)) continue;

        todasLasNoticias.push({
          id: uuidv4(),
          titulo: titulo.trim(),
          resumen: resumen.slice(0, 300).trim(),
          url: item.link || "",
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
  const contenido = fs.readFileSync(ARCHIVO_ENVIADOS, "utf-8");
  const datos = JSON.parse(contenido);
  return new Set(datos.ids);
}

// Guarda los IDs enviados actualizados
function guardarEnviados(ids) {
  const datos = { 
    actualizado: new Date().toISOString(),
    ids: Array.from(ids)
  };
  fs.writeFileSync(ARCHIVO_ENVIADOS, JSON.stringify(datos, null, 2), "utf-8");
}

// Publica solo las noticias nuevas en el canal de Telegram
async function publicarEnTelegram(noticias) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const canal = process.env.TELEGRAM_CHANNEL;

  if (!token || !canal) {
    console.log("⚠️ Variables de Telegram no configuradas, omitiendo publicación.");
    return;
  }

  // Cargar IDs ya enviados
  const enviados = cargarEnviados();

  // Filtrar solo las noticias que NO han sido enviadas antes
  const nuevas = noticias.filter((n) => !enviados.has(n.id));

  if (nuevas.length === 0) {
    console.log("ℹ️ No hay noticias nuevas para enviar a Telegram.");
    return;
  }

  console.log(`📨 Enviando ${nuevas.length} noticias nuevas a Telegram...`);

  // Publicar máximo 10 noticias nuevas
  const paraPublicar = nuevas.slice(0, 10);

  for (const noticia of paraPublicar) {
    const mensaje = `📰 *${escaparMarkdown(noticia.titulo)}*\n\n${escaparMarkdown(noticia.resumen)}\n\n🔗 [Leer en DiarioIA](https://diario-ia.vercel.app/noticia/${noticia.id})\n📌 _${escaparMarkdown(noticia.fuente)}_`;

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: `@${canal}`,
          text: mensaje,
          parse_mode: "MarkdownV2",
          disable_web_page_preview: false,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        console.error(`Error publicando en Telegram: ${data.description}`);
      } else {
        // Marcar como enviada solo si fue exitosa
        enviados.add(noticia.id);
        console.log(`✅ Publicado: ${noticia.titulo.slice(0, 50)}...`);
      }

      // Pausa de 2 segundos entre mensajes
      await new Promise((r) => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Error enviando a Telegram: ${error.message}`);
    }
  }

  // Guardar IDs actualizados
  guardarEnviados(enviados);
  console.log(`💾 Registro de enviados actualizado: ${enviados.size} noticias en total.`);
}

// Escapa caracteres especiales requeridos por MarkdownV2 de Telegram
function escaparMarkdown(texto) {
  return texto.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

// Ejecutar
async function main() {
  const noticias = await obtenerNoticias();
  await guardarNoticias(noticias);
  await publicarEnTelegram(noticias);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
