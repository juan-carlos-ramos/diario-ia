// Página de detalle de una noticia individual
import { buscarNoticiaPorId, obtenerNoticiasDeHoy } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import NoticiaCard from "@/components/NoticiaCard";
import BotonFavorito from "@/components/BotonFavorito";
import BotonCompartir from "@/components/BotonCompartir";
import BarraProgresoLectura from "@/components/BarraProgresoLectura";
import BarraAccionesMovil from "@/components/BarraAccionesMovil";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

// Genera los metadatos SEO dinámicamente para cada noticia
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const noticia = buscarNoticiaPorId(id);

  if (!noticia) {
    return { title: "Noticia no encontrada — DiarioIA" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diario-ia.vercel.app";
  const url = `${siteUrl}/noticia/${noticia.id}`;

  return {
    title: `${noticia.titulo} — DiarioIA`,
    description: noticia.resumen,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: noticia.titulo,
      description: noticia.resumen,
      url,
      images: noticia.imagen ? [{ url: noticia.imagen, width: 1200, height: 630, alt: noticia.titulo }] : [],
      type: "article",
      publishedTime: noticia.fechaPublicacion,
      authors: [noticia.fuente],
      locale: "es_ES",
      siteName: "DiarioIA",
    },
    twitter: {
      card: "summary_large_image",
      title: noticia.titulo,
      description: noticia.resumen,
      images: noticia.imagen ? [noticia.imagen] : [],
    },
  };
}

export default async function PaginaDetalle({ params }: Props) {
  const { id } = await params;
  const noticia = buscarNoticiaPorId(id);

  if (!noticia) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diario-ia.vercel.app";
  const url = `${siteUrl}/noticia/${noticia.id}`;

  // Datos estructurados JSON-LD (Schema.org / NewsArticle) para Google Discover y SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: noticia.titulo,
    description: noticia.resumen,
    image: noticia.imagen ? [noticia.imagen] : [],
    datePublished: noticia.fechaPublicacion,
    dateModified: noticia.fechaAgregada || noticia.fechaPublicacion,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Organization",
      name: noticia.fuente,
    },
    publisher: {
      "@type": "Organization",
      name: "DiarioIA",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
  };

  // Obtener "Lectura Recomendada" (máximo 3 noticias distintas a la actual)
  const archivoHoy = obtenerNoticiasDeHoy();
  const recomendadas = archivoHoy
    ? archivoHoy.noticias.filter((n) => n.id !== id).slice(0, 3)
    : [];

  return (
    <>
      {/* Barra de progreso de lectura para móviles y desktop */}
      <BarraProgresoLectura />

      {/* Inyección de JSON-LD estructurado seguro */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Header />
      <main className="max-w-3xl mx-auto px-5 py-8 pb-32 sm:pb-16 stagger-entry">
        {/* Barra móvil flotante inferior para pulgar */}
        <BarraAccionesMovil noticia={noticia} />

        {/* Barra Superior con Volver y Botones de Acción */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-xs font-bold tracking-wider uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap shadow-xs"
            aria-label="Volver a la página principal"
          >
            ← Volver
          </Link>

          <div className="flex items-center gap-2">
            <BotonCompartir noticia={noticia} size="md" mostrarTexto={true} />
            <BotonFavorito noticia={noticia} size="md" mostrarTexto={true} />
          </div>
        </div>

        {/* Imagen */}
        {noticia.imagen && (
          <div className="w-full h-64 sm:h-96 md:h-[420px] rounded-[24px] overflow-hidden mb-10 bg-[var(--color-card)] border border-[var(--color-border)] relative shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            <img
              src={noticia.imagen}
              alt={noticia.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-[68ch] mx-auto">
          {/* Fuente, fecha y tiempo de lectura */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-[0.1em] uppercase text-[var(--color-accent)]">
              {noticia.fuente}
            </span>
            <span className="text-[var(--color-subtle)]">·</span>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              {formatearFecha(noticia.fechaPublicacion)}
            </span>
            <span className="text-[var(--color-subtle)]">·</span>
            <span className="text-xs font-medium text-[var(--color-muted)] flex items-center gap-1">
              <span>⏱️</span> {noticia.tiempoLecturaMin || 1} min de lectura
            </span>
          </div>

          {/* Título Serif Editorial */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-text)] font-serif leading-[1.12] mb-8">
            {noticia.titulo}
          </h1>

          {/* Resumen General */}
          <p className="text-base sm:text-xl text-[var(--color-text)] leading-relaxed mb-8 font-normal">
            {noticia.resumen}
          </p>

          {/* Bloque En 3 Puntos Clave (IA) */}
          {Array.isArray(noticia.puntosClave) &&
            noticia.puntosClave.length > 0 &&
            !(noticia.puntosClave.length === 1 && noticia.puntosClave[0] === noticia.resumen) && (
              <div className="mb-8 p-6 sm:p-7 rounded-[22px] bg-[var(--color-card)] border border-[var(--color-border)] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-accent)] mb-4 flex items-center gap-2">
                  <span>📌</span> En 3 Puntos Clave
                </h2>
                <ul className="space-y-3.5">
                  {noticia.puntosClave.map((punto, idx) => (
                    <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-[var(--color-text)] leading-relaxed">
                      <span className="text-[var(--color-accent)] font-serif font-black text-lg leading-none mt-0.5">
                        ◈
                      </span>
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Bloque ¿Por qué importa? (IA) */}
          {noticia.porQueImporta &&
            !noticia.porQueImporta.startsWith("Novedad relevante en el sector") &&
            !noticia.porQueImporta.startsWith("Novedad relevante reportada") && (
              <div className="mb-8 p-6 sm:p-7 rounded-[22px] bg-[oklch(54%_0.17_50_/_6%)] border-l-4 border-l-[var(--color-accent)] border border-[oklch(54%_0.17_50_/_20%)]">
                <h2 className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-accent)] mb-2 flex items-center gap-2">
                  <span>💡</span> ¿Por qué importa?
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-text)] leading-relaxed font-normal">
                  {noticia.porQueImporta}
                </p>
              </div>
            )}

          {/* Tags Temáticos */}
          {Array.isArray(noticia.tags) && noticia.tags.length > 0 && (
            <div className="mb-10 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--color-muted)] font-medium mr-1">Temas:</span>
              {noticia.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-muted)] hover:text-[var(--color-accent)] border border-[var(--color-border)] text-xs font-semibold tracking-wide transition-colors interactive-tap shadow-2xs"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Botones de acción al final del artículo */}
          <div className="flex flex-wrap items-center gap-4 mb-16 pt-6 border-t border-[var(--color-border)]">
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[var(--color-accent)] text-white text-sm font-black rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 interactive-tap shadow-[0_4px_16px_oklch(54%_0.17_50_/_20%)] hover:scale-[1.02]"
              aria-label={`Leer artículo completo en ${noticia.fuente}`}
            >
              Leer artículo completo en {noticia.fuente} →
            </a>
            <BotonFavorito noticia={noticia} size="lg" mostrarTexto={true} />
            <BotonCompartir noticia={noticia} size="lg" mostrarTexto={true} />
          </div>
        </div>

        {/* Lectura Recomendada */}
        {recomendadas.length > 0 && (
          <section className="border-t border-[var(--color-border)] pt-12 mt-8">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)] font-serif mb-6 border-b border-[var(--color-border)] pb-3">
              Lectura recomendada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recomendadas.map((item, idx) => (
                <NoticiaCard key={item.id} noticia={item} index={idx} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

