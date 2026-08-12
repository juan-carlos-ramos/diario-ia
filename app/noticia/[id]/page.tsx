// Página de detalle de una noticia individual
import { buscarNoticiaPorId, obtenerNoticiasDeHoy } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import NoticiaCard from "@/components/NoticiaCard";

interface Props {
  params: Promise<{ id: string }>;
}

import Link from "next/link";

// Genera los metadatos SEO dinámicamente para cada noticia
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const noticia = buscarNoticiaPorId(id);

  if (!noticia) {
    return { title: "Noticia no encontrada — DiarioIA" };
  }

  return {
    title: `${noticia.titulo} — DiarioIA`,
    description: noticia.resumen,
    openGraph: {
      title: noticia.titulo,
      description: noticia.resumen,
      images: noticia.imagen ? [{ url: noticia.imagen }] : [],
      type: "article",
      locale: "es_ES",
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

  // Obtener "Lectura Recomendada" (máximo 3 noticias distintas a la actual)
  const archivoHoy = obtenerNoticiasDeHoy();
  const recomendadas = archivoHoy 
    ? archivoHoy.noticias.filter((n) => n.id !== id).slice(0, 3) 
    : [];

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-5 py-8 pb-32 sm:pb-16 stagger-entry">

        {/* Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-xs font-bold tracking-wider uppercase text-[var(--color-muted)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap mb-8"
          aria-label="Volver a la página principal"
        >
          ← Volver
        </Link>

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
          {/* Fuente y fecha */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-[0.1em] uppercase text-[var(--color-accent)]">
              {noticia.fuente}
            </span>
            <span className="text-[var(--color-subtle)]">·</span>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              {formatearFecha(noticia.fechaPublicacion)}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-8">
            {noticia.titulo}
          </h1>

          {/* Resumen */}
          <p className="text-base sm:text-lg md:text-xl text-[oklch(80%_0.01_200)] leading-relaxed italic border-l-2 border-[var(--color-accent)] pl-5 sm:pl-7 mb-10">
            {noticia.resumen}
          </p>

          {/* Botón leer completo */}
          <div className="mb-16">
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[var(--color-accent)] text-black text-sm font-bold rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-black interactive-tap shadow-[0_4px_16px_oklch(76%_0.19_200_/_20%)]"
              aria-label={`Leer artículo completo en ${noticia.fuente}`}
            >
              Leer artículo completo →
            </a>
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
