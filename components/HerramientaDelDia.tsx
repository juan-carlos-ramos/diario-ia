"use client";
import { HerramientaIA } from "@/lib/herramientas";
import Link from "next/link";

interface Props {
  herramienta: HerramientaIA;
}

export default function HerramientaDelDia({ herramienta }: Props) {
  return (
    <section className="w-full my-6 sm:my-10 p-5 sm:p-7 rounded-[24px] bg-[oklch(12%_0.015_200)] border border-[oklch(22%_0.025_200)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      {/* Luz ambiental sutil de fondo */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-[var(--color-accent)] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Fila 1: Badges superiores */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[oklch(76%_0.19_200_/_12%)] text-[var(--color-accent)] text-[10px] sm:text-xs font-black uppercase tracking-wider border border-[oklch(76%_0.19_200_/_25%)]">
          <span>⚡</span> Herramienta del Día
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-[oklch(75%_0.02_200)] bg-[oklch(18%_0.015_200)] px-2.5 py-0.5 rounded-full border border-[oklch(26%_0.02_200)]">
          {herramienta.precio}
        </span>
      </div>

      {/* Fila 2: Icono + Nombre + Categoría */}
      <div className="flex items-center gap-3.5 mb-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[oklch(16%_0.015_200)] border border-[oklch(26%_0.025_200)] flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
          {herramienta.icono}
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            {herramienta.nombre}
          </h3>
          <span className="text-[11px] font-semibold text-[oklch(65%_0.02_200)] uppercase tracking-wider mt-1 block">
            {herramienta.categoria.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Fila 3: Descripción completa a todo el ancho, con aire y tipografía impecable */}
      <p className="text-[13px] sm:text-sm text-[oklch(80%_0.01_200)] leading-relaxed mb-5">
        {herramienta.descripcion}
      </p>

      {/* Fila 4: Botones con tamaño táctil cómodo y microinteracciones */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-[oklch(18%_0.012_200)]">
        <Link
          href="/herramientas"
          className="text-center px-4 py-2.5 rounded-full bg-[oklch(16%_0.01_200)] hover:bg-[oklch(22%_0.015_200)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-bold tracking-wide transition-all interactive-tap order-2 sm:order-1"
        >
          Ver Directorio →
        </Link>

        <a
          href={herramienta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-black text-xs font-black tracking-wide transition-all hover:scale-[1.02] shadow-[0_4px_16px_oklch(76%_0.19_200_/_20%)] interactive-tap order-1 sm:order-2"
          aria-label={`Probar herramienta ${herramienta.nombre}`}
        >
          <span>Probar {herramienta.nombre}</span>
          <span>↗</span>
        </a>
      </div>
    </section>
  );
}
