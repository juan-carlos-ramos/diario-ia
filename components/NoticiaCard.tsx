"use client";
import { Noticia } from "@/lib/noticias";
import { formatearFecha } from "@/lib/utils";
import Link from "next/link";

interface Props {
  noticia: Noticia;
}

export default function NoticiaCard({ noticia }: Props) {
  return (
    <Link
      href={`/noticia/${noticia.id}`}
      className="group flex flex-col bg-[#161616] rounded-[12px] overflow-hidden hover:bg-[#1A1A1A] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black"
      aria-label={`Leer noticia: ${noticia.titulo}`}
    >
      {/* Imagen */}
      <div className="w-full h-44 bg-[#111111] overflow-hidden flex-shrink-0">
        {noticia.imagen ? (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-10">◈</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4">
        {/* Fuente */}
        <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#00E5FF] mb-2">
          {noticia.fuente}
        </span>

        {/* Título */}
        <h2 className="text-sm font-bold tracking-[-0.01em] text-[#F0F0F0] leading-snug mb-auto line-clamp-3 group-hover:text-[#00E5FF] transition-colors duration-200">
          {noticia.titulo}
        </h2>

        {/* Fecha */}
        <p className="text-[11px] text-[#444444] mt-3">
          {formatearFecha(noticia.fechaPublicacion)}
        </p>
      </div>
    </Link>
  );
}
