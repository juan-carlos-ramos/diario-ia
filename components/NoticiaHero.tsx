"use client";
import { Noticia } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";

interface Props {
  noticia: Noticia;
}

export default function NoticiaHero({ noticia }: Props) {
  return (
    <a
      href={`/noticia/${noticia.id}`}
      className="group relative block w-full h-[420px] sm:h-[520px] rounded-[16px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black"
      aria-label={`Noticia principal: ${noticia.titulo}`}
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        {noticia.imagen ? (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-[#161616]" />
        )}
        {/* Degradado sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Contenido sobre la imagen */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        {/* Etiqueta */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#00E5FF]">
            {noticia.fuente}
          </span>
          <span className="text-[#444444]">·</span>
          <span className="text-xs text-[#666666]">
            {formatearFecha(noticia.fechaPublicacion)}
          </span>
        </div>

        {/* Título */}
        <h2 className="text-2xl sm:text-4xl font-black tracking-[-0.02em] text-white leading-tight mb-4 group-hover:text-[#00E5FF] transition-colors duration-200 line-clamp-3">
          {noticia.titulo}
        </h2>

        {/* Resumen */}
        <p className="text-sm sm:text-base text-[#999999] line-clamp-2 max-w-2xl">
          {noticia.resumen}
        </p>
      </div>
    </a>
  );
}
