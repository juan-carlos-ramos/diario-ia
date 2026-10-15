import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import BotonFavorito from "@/components/BotonFavorito";
import BotonCompartir from "@/components/BotonCompartir";
import BarraProgresoLectura from "@/components/BarraProgresoLectura";
import {
  buscarNoticiaPorId,
  listarFechasDisponibles,
  leerArchivoPorFecha,
  type Noticia,
} from "@/lib/noticias";
import {
  esPorQueImportaSignificativo,
  obtenerPuntosClaveValidos,
  titularPuntosClave,
} from "@/lib/puntos-clave";
import { formatearFecha } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Contrato compartido con el backend: la bandera `enriquecidoConIA` es
 * opcional y puede no existir todavía. Se trata de forma tolerante.
 */
type NoticiaEnriquecida = Noticia & { enriquecidoConIA?: boolean };

export const revalidate = 3600;

/**
 * Pre-genera rutas estáticas para las noticias de las ediciones más recientes,
 * permitiendo carga instantánea en el cliente y renderizado bajo demanda para el resto.
 */
export async function generateStaticParams() {
  const fechas = listarFechasDisponibles().slice(0, 3);
  const ids: { id: string }[] = [];

  for (const fecha of fechas) {
    const archivo = leerArchivoPorFecha(fecha);
    if (!archivo?.noticias) continue;
    for (const n of archivo.noticias) {
      ids.push({ id: n.id });
    }
  }

  return ids;
}

/**
 * Genera metadatos dinámicos OpenGraph y Twitter para SEO editorial y social sharing.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const noticia = buscarNoticiaPorId(id);

  if (!noticia) {
    return {
      title: "Noticia no encontrada | DiarioIA",
      description: "El artículo solicitado no existe en la hemeroteca de DiarioIA.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diario-ia.vercel.app";
  const urlArticulo = `${siteUrl}/noticia/${noticia.id}`;

  return {
    title: noticia.titulo,
    description: noticia.resumen,
    alternates: {
      canonical: urlArticulo,
    },
    openGraph: {
      title: noticia.titulo,
      description: noticia.resumen,
      url: urlArticulo,
      siteName: "DiarioIA",
      type: "article",
      publishedTime: noticia.fechaPublicacion,
      authors: [noticia.fuente],
      images: noticia.imagen
        ? [
            {
              url: noticia.imagen,
              alt: noticia.titulo,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: noticia.titulo,
      description: noticia.resumen,
      images: noticia.imagen ? [noticia.imagen] : undefined,
    },
  };
}

/**
 * Vista de lectura editorial "The Modern Broadsheet" para una noticia individual.
 */
export default async function PaginaNoticia({ params }: Props) {
  const { id } = await params;
  const noticia = buscarNoticiaPorId(id);

  if (!noticia) {
    notFound();
  }

  // Degradación honesta: si el backend marca la noticia como NO enriquecida,
  // los bloques de análisis se ocultan. Nunca se disfraza relleno de editorial.
  const enriquecidoConIA = (noticia as NoticiaEnriquecida).enriquecidoConIA;
  const fueEnriquecida = enriquecidoConIA !== false;

  // Solo se muestran puntos realmente informativos (sin duplicar el resumen).
  const puntosClave = fueEnriquecida
    ? obtenerPuntosClaveValidos(noticia.puntosClave, noticia.resumen)
    : [];
  const mostrarPuntosClave = puntosClave.length > 0;
  const tituloPuntos = titularPuntosClave(puntosClave.length);

  const mostrarPorQueImporta =
    fueEnriquecida && esPorQueImportaSignificativo(noticia.porQueImporta);

  const tieneTags = Array.isArray(noticia.tags) && noticia.tags.length > 0;

  return (
    <>
      <BarraProgresoLectura />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 pb-28 sm:pb-16 stagger-entry">
        {/* Barra superior de navegación y acciones rápidas */}
        <nav
          aria-label="Navegación secundaria"
          className="mb-6 flex items-center justify-between gap-4"
        >
          <Link
            href="/"
            className="text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded-lg px-2 py-1 interactive-tap"
          >
            <span>←</span>
            <span>Volver a la portada</span>
          </Link>

          <div className="flex items-center gap-2">
            <BotonCompartir noticia={noticia} size="sm" />
            <BotonFavorito noticia={noticia} size="sm" />
          </div>
        </nav>

        {/* Artículo principal */}
        <article className="article-sheet space-y-8 sm:space-y-10">
          {/* Metadatos editoriales de imprenta */}
          <header className="border-b border-[var(--color-border)] pb-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs mb-3">
              <span className="font-extrabold tracking-[0.14em] uppercase text-[var(--color-accent)] px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
                {noticia.categoria}
              </span>
              <span className="text-[var(--color-subtle)]">·</span>
              <span className="font-bold text-[var(--color-text)]">
                {noticia.fuente}
              </span>
              <span className="text-[var(--color-subtle)]">·</span>
              <time
                dateTime={noticia.fechaPublicacion}
                className="text-[var(--color-muted)] font-medium"
              >
                {formatearFecha(noticia.fechaPublicacion)}
              </time>
              <span className="text-[var(--color-subtle)]">·</span>
              <span className="text-[var(--color-muted)] font-medium">
                ⏱️ {noticia.tiempoLecturaMin || 1} min de lectura
              </span>
            </div>

            {/* Titular periodístico en Newsreader serif */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight text-[var(--color-text)] leading-[1.18] mt-2 text-balance">
              {noticia.titulo}
            </h1>
          </header>

          {/* Fotografía editorial si está disponible */}
          {noticia.imagen && (
            <figure className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
              <img
                src={noticia.imagen}
                alt={noticia.titulo}
                className="w-full max-h-[520px] object-cover"
                loading="eager"
              />
              <figcaption className="px-4 py-2 text-[11px] text-[var(--color-muted)] border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
                <span>Fotografía / Gráfico vía {noticia.fuente}</span>
                <span className="text-[10px] text-[var(--color-subtle)] uppercase tracking-wider">
                  DiarioIA Archivo
                </span>
              </figcaption>
            </figure>
          )}

          {/* Bloque destacado: puntos clave (solo si hay análisis real) */}
          {mostrarPuntosClave && (
            <section
              aria-labelledby="puntos-clave-titulo"
              className="p-5 sm:p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-accent)] shadow-xs"
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-base text-[var(--color-accent)]"
                  aria-hidden="true"
                >
                  ⚡
                </span>
                <h2
                  id="puntos-clave-titulo"
                  className="text-xs font-black tracking-[0.14em] uppercase text-[var(--color-accent)]"
                >
                  {tituloPuntos}
                </h2>
              </div>
              <ul className="space-y-3.5 text-sm sm:text-base text-[var(--color-text)] leading-relaxed">
                {puntosClave.map((punto, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-pretty"
                  >
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 w-5 h-5 rounded-full bg-[oklch(76%_0.165_72_/_20%)] text-[var(--color-accent)] text-xs font-extrabold flex items-center justify-center mt-0.5"
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 font-normal">{punto}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Bloque de contexto: ¿Por qué importa? (solo si aporta criterio real) */}
          {mostrarPorQueImporta && (
            <section
              aria-labelledby="por-que-importa-titulo"
              className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-base text-[var(--color-accent)]"
                  aria-hidden="true"
                >
                  💡
                </span>
                <h2
                  id="por-que-importa-titulo"
                  className="text-xs font-black tracking-[0.14em] uppercase text-[var(--color-accent)]"
                >
                  ¿Por qué importa?
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[var(--color-text)] font-normal leading-relaxed italic font-serif text-pretty">
                &ldquo;{noticia.porQueImporta}&rdquo;
              </p>
            </section>
          )}

          {/* Cuerpo de la noticia */}
          <section
            aria-label="Contenido de la noticia"
            className="text-base sm:text-lg text-[var(--color-text)] leading-relaxed font-normal"
          >
            <p className="first-letter:text-4xl first-letter:font-serif first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:text-[var(--color-accent)] leading-relaxed text-pretty">
              {noticia.resumen}
            </p>
          </section>

          {/* Enlace a la noticia original */}
          {noticia.url && (
            <section
              aria-label="Fuente original"
              className="p-5 sm:p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
            >
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)] font-serif">
                  Leer noticia original completa
                </h3>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  Continúa la lectura en el sitio oficial de {noticia.fuente}
                </p>
              </div>
              <a
                href={noticia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-[var(--color-on-accent)] text-xs font-bold transition-transform active:scale-95 interactive-tap shadow-[0_2px_12px_oklch(54%_0.17_50_/_20%)] flex-shrink-0"
                aria-label={`Leer noticia original completa en ${noticia.fuente}`}
              >
                <span>Leer en {noticia.fuente}</span>
                <span>→</span>
              </a>
            </section>
          )}

          {/* Tags temáticos */}
          {tieneTags && (
            <section
              aria-label="Etiquetas temáticas"
              className="pt-6 border-t border-[var(--color-border)]"
            >
              <h3 className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
                Temas relacionados
              </h3>
              <div className="flex flex-wrap gap-2">
                {noticia.tags!.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Barra inferior de acciones del lector */}
          <footer className="flex flex-wrap items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <div className="flex items-center gap-2">
              <BotonFavorito noticia={noticia} size="md" mostrarTexto />
              <BotonCompartir noticia={noticia} size="md" mostrarTexto />
            </div>

            <Link
              href="/"
              className="text-xs font-bold text-[var(--color-accent)] hover:underline interactive-tap"
            >
              ← Volver a la portada
            </Link>
          </footer>
        </article>
      </main>

      <footer className="mt-8 border-t border-[var(--color-border)] py-8 text-center text-xs text-[var(--color-muted)]">
        DiarioIA · Actualizado cada 24 horas con las principales novedades de Inteligencia Artificial
      </footer>
    </>
  );
}
