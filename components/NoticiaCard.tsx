"use client";
import { Noticia } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import Link from "next/link";
import BotonFavorito from "./BotonFavorito";
import BotonCompartir from "./BotonCompartir";

interface Props {
  noticia: Noticia;
  index?: number;
}

export default function NoticiaCard({ noticia, index }: Props) {
  return (
    <Link
      href={`/noticia/${noticia.id}`}
      style={index !== undefined ? { animationDelay: `${index * 35}ms` } : undefined}
      className="group flex flex-col bg-[var(--color-card)] border border-[var(--color-border)] rounded-[16px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-black interactive-tap pc-hover-card stagger-item relative"
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

        {/* Acciones flotantes superiores */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <BotonCompartir noticia={noticia} size="sm" />
          <BotonFavorito noticia={noticia} size="sm" />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-5">
        {/* Fuente y Tag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--color-accent)]">
            {noticia.fuente}
          </span>
          {Array.isArray(noticia.tags) && noticia.tags[0] && (
            <>
              <span className="text-[var(--color-subtle)] text-[10px]">·</span>
              <span className="text-[10px] font-semibold text-[oklch(75%_0.02_200)]">
                #{noticia.tags[0]}
              </span>
            </>
          )}
        </div>

        {/* Título */}
        <h2 className="text-sm font-bold tracking-tight text-[var(--color-text)] leading-snug mb-auto line-clamp-3 pc-hover-title transition-colors duration-200">
          {noticia.titulo}
        </h2>

        {/* Fecha y Tiempo de Lectura */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[oklch(15%_0.008_200)]">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted)] font-medium tracking-wide">
            <span>{formatearFecha(noticia.fechaPublicacion)}</span>
            <span className="text-[var(--color-subtle)]">·</span>
            <span>⏱️ {noticia.tiempoLecturaMin || 1}m</span>
          </div>
          <span className="text-[10px] font-bold text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
            Leer →
          </span>
        </div>
      </div>
    </Link>
  );
}


