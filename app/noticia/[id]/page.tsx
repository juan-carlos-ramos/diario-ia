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
      <main className="max-w-3xl mx-auto px-4 py-10 pb-24 sm:pb-10">

        {/* Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase text-[#444444] hover:text-[#00E5FF] transition-colors mb-8 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] rounded"
          aria-label="Volver a la página principal"
        >
          ← Volver
        </Link>

        {/* Imagen */}
        {noticia.imagen && (
          <div className="w-full h-64 sm:h-96 rounded-[16px] overflow-hidden mb-8 bg-[#111111]">
            <img
              src={noticia.imagen}
              alt={noticia.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Fuente y fecha */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#00E5FF]">
            {noticia.fuente}
          </span>
          <span className="text-[#333333]">·</span>
          <span className="text-xs text-[#444444]">
            {formatearFecha(noticia.fechaPublicacion)}
          </span>
        </div>

        {/* Título */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#F0F0F0] leading-tight mb-8">
          {noticia.titulo}
        </h1>

        {/* Resumen */}
        <p className="text-lg sm:text-xl text-[#A0A0A0] leading-relaxed mb-10 border-l-4 border-[#00E5FF] pl-6">
          {noticia.resumen}
        </p>

        {/* Botón leer completo */}
        <a
          href={noticia.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00E5FF] text-black text-sm font-bold rounded-full hover:bg-[#00B8CC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black mb-16"
          aria-label={`Leer artículo completo en ${noticia.fuente}`}
        >
          Leer artículo completo →
        </a>

        {/* Lectura Recomendada */}
        {recomendadas.length > 0 && (
          <section className="border-t border-[#222222] pt-12 mt-8">
            <h3 className="text-xl font-bold tracking-tight text-[#E0E0E0] mb-6">
              Lectura recomendada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recomendadas.map((item) => (
                <NoticiaCard key={item.id} noticia={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
