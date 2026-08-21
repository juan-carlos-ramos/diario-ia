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
    <div className="relative w-full rounded-[24px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <Link
        href={`/noticia/${noticia.id}`}
        className="group relative block w-full h-[380px] sm:h-[480px] md:h-[520px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap pc-hover-hero"
        aria-label={`Noticia principal: ${noticia.titulo}`}
      >
        {/* Imagen de fondo */}
        <div className="absolute inset-0 bg-[var(--color-bg)]">
          {noticia.imagen ? (
            <img
              src={noticia.imagen}
              alt={noticia.titulo}
              className="w-full h-full object-cover pc-hover-hero-img transition-transform duration-700 ease-out"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-card)]" />
          )}
          {/* Degradado sobre la imagen optimizado para legibilidad móvil */}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(10%_0.008_200_/_95%)] via-[oklch(10%_0.008_200_/_60%)] to-transparent" />
        </div>

        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 flex flex-col justify-end h-full">
          {/* Etiqueta y Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--color-accent)]">
              {noticia.fuente}
            </span>
            <span className="text-[var(--color-muted)]">·</span>
            <span className="text-[11px] font-medium text-[var(--color-muted)]">
              {formatearFecha(noticia.fechaPublicacion)}
            </span>
            <span className="text-[var(--color-muted)]">·</span>
            <span className="text-[11px] font-medium text-[oklch(75%_0.02_200)]">
              ⏱️ {noticia.tiempoLecturaMin || 1} min
            </span>
            {Array.isArray(noticia.tags) && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                {noticia.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-[oklch(15%_0.008_200_/_90%)] text-[oklch(85%_0.02_200)] text-[10px] font-bold tracking-wide border border-[var(--color-border)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Título */}
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight mb-3 sm:mb-4 pc-hover-hero-title transition-colors duration-200 line-clamp-3">
            {noticia.titulo}
          </h2>

          {/* Resumen */}
          <p className="text-xs sm:text-sm md:text-base text-[var(--color-muted)] line-clamp-2 max-w-2xl font-medium">
            {noticia.resumen}
          </p>
        </div>
      </Link>

      {/* Botones de acción flotantes en Hero */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <BotonCompartir noticia={noticia} size="md" />
        <BotonFavorito noticia={noticia} size="md" />
      </div>
    </div>
  );
}


