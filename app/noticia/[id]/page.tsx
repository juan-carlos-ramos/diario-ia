// Página de detalle de una noticia individual
import { buscarNoticiaPorId, obtenerNoticiasDeHoy } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import NoticiaCard from "@/components/NoticiaCard";
import BotonFavorito from "@/components/BotonFavorito";
import BotonCompartir from "@/components/BotonCompartir";
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
      {/* Inyección de JSON-LD estructurado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <main className="max-w-3xl mx-auto px-5 py-8 pb-32 sm:pb-16 stagger-entry">
        {/* Barra Superior con Volver y Botones de Acción */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-xs font-bold tracking-wider uppercase text-[var(--color-muted)] hover:text-white hover:border-[var(--color-border-hover)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap"
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
          <div className="w-full h-64 sm:h-96 md:h-[420px] rounded-[24px] overflow-hidden mb-10 bg-[var(--color-card)] border border-[var(--color-border)] relative shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
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
            <span className="text-xs font-medium text-[oklch(75%_0.02_200)] flex items-center gap-1">
              <span>⏱️</span> {noticia.tiempoLecturaMin || 1} min de lectura
            </span>
          </div>

          {/* Título */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-8">
            {noticia.titulo}
          </h1>

          {/* Resumen General */}
          <p className="text-base sm:text-lg text-[oklch(85%_0.01_200)] leading-relaxed mb-8">
            {noticia.resumen}
          </p>

          {/* Bloque En 3 Puntos Clave (IA) - Solo si son puntos sintetizados distintos al resumen */}
          {Array.isArray(noticia.puntosClave) &&
            noticia.puntosClave.length > 0 &&
            !(noticia.puntosClave.length === 1 && noticia.puntosClave[0] === noticia.resumen) && (
              <div className="mb-8 p-5 sm:p-6 rounded-[20px] bg-[oklch(12%_0.01_200)] border border-[oklch(22%_0.015_200)] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] mb-4 flex items-center gap-2">
                  <span>📌</span> Puntos Clave de la Noticia
                </h2>
                <ul className="space-y-3">
                  {noticia.puntosClave.map((punto, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-[oklch(90%_0.005_200)] leading-relaxed">
                      <span className="text-[var(--color-accent)] font-bold text-base leading-none mt-1">
                        ◈
                      </span>
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Bloque ¿Por qué importa? (IA) - Solo si es análisis editorial específico */}
          {noticia.porQueImporta &&
            !noticia.porQueImporta.startsWith("Novedad relevante en el sector") &&
            !noticia.porQueImporta.startsWith("Novedad relevante reportada") && (
              <div className="mb-8 p-5 sm:p-6 rounded-[20px] bg-gradient-to-br from-[oklch(14%_0.02_200)] to-[oklch(10%_0.01_200)] border-l-4 border-l-[var(--color-accent)] border border-[oklch(20%_0.01_200)]">
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)] mb-2 flex items-center gap-2">
                  <span>💡</span> ¿Por qué importa?
                </h2>
                <p className="text-sm sm:text-base text-[oklch(88%_0.01_200)] leading-relaxed font-medium">
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
                  className="px-3 py-1 rounded-full bg-[oklch(15%_0.008_200)] hover:bg-[oklch(22%_0.015_200)] text-[var(--color-muted)] hover:text-[var(--color-accent)] border border-[var(--color-border)] text-xs font-semibold tracking-wide transition-colors interactive-tap"
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
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[var(--color-accent)] text-black text-sm font-bold rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-black interactive-tap shadow-[0_4px_16px_oklch(76%_0.19_200_/_20%)] hover:scale-[1.02]"
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
            <h3 className="text-lg font-extrabold tracking-tight text-white mb-6 border-b border-[var(--color-border)] pb-3">
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

