// Página de detalle de una noticia individual
import { buscarNoticiaPorId } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";

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

  const categoriaColor: Record<string, string> = {
    tecnologia: "bg-blue-100 text-blue-700",
    investigacion: "bg-purple-100 text-purple-700",
    productividad: "bg-green-100 text-green-700",
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Volver */}
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#1A73E8] hover:underline mb-8 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-2 rounded"
          aria-label="Volver a la página principal"
        >
          ← Volver a DiarioIA
        </a>

        {/* Imagen */}
        {noticia.imagen && (
          <div className="w-full h-64 sm:h-80 rounded-[12px] overflow-hidden mb-8 bg-[#F8F9FA]">
            <img
              src={noticia.imagen}
              alt={noticia.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Categoría y fuente */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              categoriaColor[noticia.categoria] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {noticia.categoria}
          </span>
          <span className="text-sm text-[#5F6368]">{noticia.fuente}</span>
          <span className="text-sm text-[#9AA0A6]">
            {formatearFecha(noticia.fechaPublicacion)}
          </span>
        </div>

        {/* Título */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] leading-snug mb-6">
          {noticia.titulo}
        </h1>

        {/* Resumen */}
        <p className="text-base text-[#3C4043] leading-relaxed mb-10 border-l-4 border-[#1A73E8] pl-4 bg-[#F8F9FA] py-4 pr-4 rounded-r-lg">
          {noticia.resumen}
        </p>

        {/* Botón leer completo */}
        <a
          href={noticia.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A73E8] text-white font-medium rounded-[8px] hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-2"
          aria-label={`Leer artículo completo en ${noticia.fuente}`}
        >
          Leer artículo completo en {noticia.fuente} →
        </a>
      </main>

      <footer className="mt-16 border-t border-gray-100 py-8 text-center text-xs text-[#9AA0A6]">
        DiarioIA · Actualizado automáticamente cada 24 horas · Solo noticias en
        español
      </footer>
    </>
  );
}
