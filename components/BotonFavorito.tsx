"use client";
import { useFavoritos } from "@/lib/favoritos";
import type { Noticia } from "@/lib/noticias";

interface Props {
  noticia: Noticia;
  size?: "sm" | "md" | "lg";
  mostrarTexto?: boolean;
  className?: string;
}

export default function BotonFavorito({
  noticia,
  size = "md",
  mostrarTexto = false,
  className = "",
}: Props) {
  const { esFavorito, toggle, montado } = useFavoritos();
  const guardado = montado ? esFavorito(noticia.id) : false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(noticia);
  };

  const dimensionesIcono = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  const paddingBoton = {
    sm: "p-1.5",
    md: "p-2",
    lg: "px-3 py-2",
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={guardado ? "Eliminar de favoritos" : "Guardar en favoritos"}
      title={guardado ? "Eliminar de favoritos" : "Guardar en favoritos"}
      className={`relative inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] active:scale-90 interactive-tap ${paddingBoton} ${
        guardado
          ? "bg-[oklch(76%_0.165_72_/_15%)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-[0_2px_12px_oklch(76%_0.165_72_/_20%)]"
          : "bg-[var(--color-bg)]/80 text-[var(--color-muted)] hover:text-white border border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
      } ${className}`}
    >
      {guardado ? (
        // Icono Relleno (Guardado)
        <svg
          className={`${dimensionesIcono} transition-transform duration-200 scale-110`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 2h14a1 1 0 0 1 1 1v19.143a.5.5 0 0 1-.766.424L12 18.03l-7.234 4.536A.5.5 0 0 1 4 22.143V3a1 1 0 0 1 1-1z" />
        </svg>
      ) : (
        // Icono Línea (No guardado)
        <svg
          className={dimensionesIcono}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )}

      {mostrarTexto && (
        <span className="text-xs font-semibold tracking-wide">
          {guardado ? "Guardado" : "Guardar"}
        </span>
      )}
    </button>
  );
}
