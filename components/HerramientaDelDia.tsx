"use client";
import { HerramientaIA } from "@/lib/herramientas";
import Link from "next/link";

interface Props {
  herramienta: HerramientaIA;
}

export default function HerramientaDelDia({ herramienta }: Props) {
  return (
    <section className="w-full my-6 sm:my-10 p-5 sm:p-7 rounded-[24px] bg-[var(--color-card)] border border-[var(--color-border)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative overflow-hidden group">
      {/* Luz ambiental sutil de fondo */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-[var(--color-accent)] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Fila 1: Badges superiores */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[oklch(54%_0.17_50_/_10%)] text-[var(--color-accent)] text-[10px] sm:text-xs font-black uppercase tracking-wider border border-[oklch(54%_0.17_50_/_25%)]">
          <span>⚡</span> Herramienta del Día
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-[var(--color-muted)] bg-[var(--color-surface)] px-2.5 py-0.5 rounded-full border border-[var(--color-border)]">
          {herramienta.precio}
        </span>
      </div>

      {/* Fila 2: Icono + Nombre + Categoría */}
      <div className="flex items-center gap-3.5 mb-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
          {herramienta.icono}
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-[var(--color-text)] tracking-tight leading-none">
            {herramienta.nombre}
          </h3>
          <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mt-1 block">
            {herramienta.categoria.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Fila 3: Descripción completa a todo el ancho, con aire y tipografía impecable */}
      <p className="text-[13px] sm:text-sm text-[var(--color-text)] leading-relaxed mb-5 font-normal">
        {herramienta.descripcion}
      </p>

      {/* Fila 4: Botones con tamaño táctil cómodo y microinteracciones */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
        <Link
          href="/herramientas"
          className="text-center px-4 py-2.5 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-bold tracking-wide transition-all interactive-tap order-2 sm:order-1"
        >
          Ver Directorio →
        </Link>

        <a
          href={herramienta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-black tracking-wide transition-all hover:scale-[1.02] shadow-[0_4px_16px_oklch(54%_0.17_50_/_25%)] interactive-tap order-1 sm:order-2"
          aria-label={`Probar herramienta ${herramienta.nombre}`}
        >
          <span>Probar {herramienta.nombre}</span>
          <span>↗</span>
        </a>
      </div>
    </section>
  );
}
