"use client";
import { Noticia } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import Link from "next/link";

interface Props {
  noticia: Noticia;
  index?: number;
}

export default function NoticiaCard({ noticia, index }: Props) {
  return (
    <Link
      href={`/noticia/${noticia.id}`}
      style={index !== undefined ? { animationDelay: `${index * 35}ms` } : undefined}
      className="group flex flex-col bg-[var(--color-card)] border border-[var(--color-border)] rounded-[16px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-black interactive-tap pc-hover-card stagger-item"
      aria-label={`Leer noticia: ${noticia.titulo}`}
    >
      {/* Imagen */}
      <div className="w-full h-44 bg-[var(--color-bg)] overflow-hidden flex-shrink-0 relative border-b border-[var(--color-border)]">
        {noticia.imagen ? (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="w-full h-full object-cover pc-hover-img transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg)]">
            <span className="text-3xl text-[var(--color-accent)] opacity-20">◈</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-5">
        {/* Fuente */}
        <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--color-accent)] mb-2">
          {noticia.fuente}
        </span>

        {/* Título */}
        <h2 className="text-sm font-bold tracking-tight text-[var(--color-text)] leading-snug mb-auto line-clamp-3 pc-hover-title transition-colors duration-200">
          {noticia.titulo}
        </h2>

        {/* Fecha */}
        <p className="text-[11px] text-[var(--color-muted)] mt-4 font-medium tracking-wide">
          {formatearFecha(noticia.fechaPublicacion)}
        </p>
      </div>
    </Link>
  );
}

