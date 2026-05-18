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
      className="group relative block w-full h-[380px] sm:h-[480px] md:h-[520px] rounded-[24px] overflow-hidden border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-black interactive-tap pc-hover-hero stagger-item"
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
        {/* Etiqueta */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--color-accent)]">
            {noticia.fuente}
          </span>
          <span className="text-[var(--color-muted)]">·</span>
          <span className="text-[11px] font-medium text-[var(--color-muted)]">
            {formatearFecha(noticia.fechaPublicacion)}
          </span>
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
    </a>
  );
}

