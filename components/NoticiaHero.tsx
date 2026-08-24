"use client";
import { Noticia } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import Link from "next/link";
import BotonFavorito from "./BotonFavorito";
import BotonCompartir from "./BotonCompartir";

interface Props {
  noticia: Noticia;
}

export default function NoticiaHero({ noticia }: Props) {
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <Link
        href={`/noticia/${noticia.id}`}
        className="group relative block w-full h-[380px] sm:h-[480px] md:h-[520px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap pc-hover-hero"
        aria-label={`Noticia principal: ${noticia.titulo}`}
      >
        {/* Imagen de fondo */}
        <div className="absolute inset-0 bg-neutral-900">
          {noticia.imagen ? (
            <img
              src={noticia.imagen}
              alt={noticia.titulo}
              className="w-full h-full object-cover pc-hover-hero-img transition-transform duration-700 ease-out"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
          {/* Degradado oscuro profundo para garantizar 100% de contraste y legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/15" />
        </div>

        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 flex flex-col justify-end h-full">
          {/* Etiqueta y Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-[#F5A623] px-2 py-0.5 rounded-md bg-black/40 border border-[#F5A623]/30 backdrop-blur-xs">
              {noticia.fuente}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-[11px] font-medium text-white/80">
              {formatearFecha(noticia.fechaPublicacion)}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-[11px] font-medium text-white/90">
              ⏱️ {noticia.tiempoLecturaMin || 1} min
            </span>
            {Array.isArray(noticia.tags) && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                {noticia.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full bg-black/50 text-white/90 text-[10px] font-bold tracking-wide border border-white/20 backdrop-blur-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Título Serif Editorial en Blanco Nítido con Alto Contraste */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-serif leading-[1.18] mb-3 sm:mb-4 drop-shadow-md line-clamp-3">
            {noticia.titulo}
          </h2>

          {/* Resumen */}
          <p className="text-xs sm:text-sm md:text-base text-white/85 line-clamp-2 max-w-2xl font-normal leading-relaxed drop-shadow-xs">
            {noticia.resumen}
          </p>
        </div>
      </Link>

      {/* Botones de acción flotantes en Hero */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <BotonCompartir
          noticia={noticia}
          size="md"
          className="bg-black/60 text-white border-white/20 hover:bg-black/80 shadow-md backdrop-blur-xs"
        />
        <BotonFavorito
          noticia={noticia}
          size="md"
          className="bg-black/60 text-white border-white/20 hover:bg-black/80 shadow-md backdrop-blur-xs"
        />
      </div>
    </div>
  );
}
