"use client";
import { Noticia } from "@/lib/noticias";
import Link from "next/link";
import BotonFavorito from "./BotonFavorito";
import BotonCompartir from "./BotonCompartir";

interface Props {
  noticia: Noticia;
}

export default function BarraAccionesMovil({ noticia }: Props) {
  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border)] px-4 py-2.5 pb-[max(14px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Barra de acciones del artículo"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Volver */}
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] text-sm interactive-tap focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label="Volver al inicio"
        >
          ←
        </Link>

        {/* Acciones principales */}
        <div className="flex items-center gap-2">
          <BotonFavorito noticia={noticia} size="sm" mostrarTexto={false} />
          <BotonCompartir noticia={noticia} size="sm" mostrarTexto={false} />
        </div>

        {/* Botón Fuente Original */}
        {noticia.url && (
          <a
            href={noticia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-black tracking-wide interactive-tap focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow-[0_2px_12px_oklch(54%_0.17_50_/_20%)]"
            aria-label={`Leer fuente original en ${noticia.fuente}`}
          >
            <span>Fuente original</span>
            <span>↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
