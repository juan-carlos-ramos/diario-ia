"use client";
import { useState } from "react";
import type { Noticia } from "@/lib/noticias";

interface Props {
  noticia: Noticia;
  size?: "sm" | "md" | "lg";
  mostrarTexto?: boolean;
  className?: string;
}

export default function BotonCompartir({
  noticia,
  size = "md",
  mostrarTexto = false,
  className = "",
}: Props) {
  const [copiado, setCopiado] = useState(false);

  const urlCompleta =
    typeof window !== "undefined"
      ? `${window.location.origin}/noticia/${noticia.id}`
      : `https://diario-ia.vercel.app/noticia/${noticia.id}`;

  const handleCompartir = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si el navegador soporta Web Share API (Móviles)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${noticia.titulo} — DiarioIA`,
          text: noticia.resumen,
          url: urlCompleta,
        });
        return;
      } catch (err: any) {
        // Si el usuario cancela la hoja de compartir nativa, no hacemos nada
        if (err.name === "AbortError") return;
      }
    }

    // Fallback: Copiar al portapapeles
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(urlCompleta);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch (error) {
      console.error("Error al copiar enlace:", error);
    }
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
      onClick={handleCompartir}
      aria-label={copiado ? "Enlace copiado al portapapeles" : "Compartir noticia"}
      title={copiado ? "¡Enlace copiado!" : "Compartir noticia"}
      className={`relative inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] active:scale-90 interactive-tap ${paddingBoton} ${
        copiado
          ? "bg-[oklch(76%_0.19_200_/_20%)] text-[var(--color-accent)] border border-[var(--color-accent)]"
          : "bg-[oklch(10%_0.008_200_/_80%)] text-[var(--color-muted)] hover:text-white border border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
      } ${className}`}
    >
      {copiado ? (
        // Icono Check cuando se ha copiado
        <svg
          className={`${dimensionesIcono} text-[var(--color-accent)]`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        // Icono Compartir
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
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}

      {mostrarTexto && (
        <span className="text-xs font-semibold tracking-wide">
          {copiado ? "¡Copiado!" : "Compartir"}
        </span>
      )}
    </button>
  );
}
