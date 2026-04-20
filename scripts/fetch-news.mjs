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
    url: "https://feeds.weblogssl.com/xataka",
    categoria: "tecnologia",
  },
  {
    nombre: "Hipertextual",
    url: "https://hipertextual.com/feed",
    categoria: "tecnologia",
  },
  {
    nombre: "MIT Technology Review ES",
    url: "https://www.technologyreview.es/rss.xml",
    categoria: "investigacion",
  },
  {
    nombre: "Genbeta",
    url: "https://feeds.weblogssl.com/genbeta",
    categoria: "productividad",
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
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
  if (item.enclosure?.url) return item.enclosure.url;
  if (item.itunes?.image) return item.itunes.image;
  return null;
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
}

// Ejecutar
obtenerNoticias()
  .then(guardarNoticias)
  .catch((err) => {
    console.error("Error fatal:", err);
    process.exit(1);
  });
