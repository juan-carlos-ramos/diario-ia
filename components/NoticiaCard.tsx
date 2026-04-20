"use client";

// Tarjeta individual de noticia estilo Google Blog
import { Noticia } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";

interface Props {
  noticia: Noticia;
}

export default function NoticiaCard({ noticia }: Props) {
  const categoriaColor: Record<string, string> = {
    tecnologia: "bg-blue-100 text-blue-700",
    investigacion: "bg-purple-100 text-purple-700",
    productividad: "bg-green-100 text-green-700",
  };

  return (
    <a
      href={noticia.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-[12px] overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:ring-offset-2"
      aria-label={`Leer noticia: ${noticia.titulo}`}
    >
      {/* Imagen */}
      <div className="w-full h-48 bg-[#F8F9FA] flex items-center justify-center overflow-hidden">
        {noticia.imagen ? (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-5xl opacity-30">🤖</span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Categoría y fuente */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              categoriaColor[noticia.categoria] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {noticia.categoria}
          </span>
          <span className="text-xs text-[#5F6368]">{noticia.fuente}</span>
        </div>

        {/* Título */}
        <h2 className="text-base font-semibold text-[#202124] leading-snug mb-2 group-hover:text-[#1A73E8] transition-colors line-clamp-2">
          {noticia.titulo}
        </h2>

        {/* Resumen */}
        <p className="text-sm text-[#5F6368] leading-relaxed line-clamp-3 mb-4">
          {noticia.resumen}
        </p>

        {/* Fecha */}
        <p className="text-xs text-[#9AA0A6]">
          {formatearFecha(noticia.fechaPublicacion)}
        </p>
      </div>
    </a>
  );
}
