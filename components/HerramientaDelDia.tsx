"use client";
import { HerramientaIA } from "@/lib/herramientas";
import Link from "next/link";

interface Props {
  herramienta: HerramientaIA;
}

export default function HerramientaDelDia({ herramienta }: Props) {
  return (
    <section className="w-full my-10 p-6 sm:p-8 rounded-[24px] bg-gradient-to-r from-[oklch(14%_0.02_200)] via-[oklch(12%_0.015_200)] to-[oklch(10%_0.01_200)] border border-[oklch(24%_0.03_200)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
      {/* Luz ambiental de fondo */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-accent)] opacity-[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className="w-14 h-14 rounded-2xl bg-[oklch(18%_0.02_200)] border border-[oklch(28%_0.03_200)] flex items-center justify-center text-3xl flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            {herramienta.icono}
          </div>

          <div>
            {/* Badge superior */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[oklch(76%_0.19_200_/_15%)] text-[var(--color-accent)] text-[10px] font-extrabold uppercase tracking-wider border border-[oklch(76%_0.19_200_/_30%)]">
                ⚡ Herramienta de IA del Día
              </span>
              <span className="text-[10px] font-bold text-[oklch(75%_0.02_200)] bg-[oklch(20%_0.01_200)] px-2 py-0.5 rounded-md">
                {herramienta.precio}
              </span>
            </div>

            {/* Nombre y descripción */}
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {herramienta.nombre}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1.5 max-w-xl leading-relaxed">
              {herramienta.descripcion}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
          <Link
            href="/herramientas"
            className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-full bg-[oklch(16%_0.01_200)] hover:bg-[oklch(22%_0.015_200)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-bold tracking-wide transition-all interactive-tap"
          >
            Ver Directorio →
          </Link>

          <a
            href={herramienta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-black text-xs font-extrabold tracking-wide transition-all hover:scale-[1.02] shadow-[0_4px_16px_oklch(76%_0.19_200_/_25%)] interactive-tap"
            aria-label={`Probar herramienta ${herramienta.nombre}`}
          >
            Probar Gratis ↗
          </a>
        </div>
      </div>
    </section>
  );
}
