"use client";
import { useState, useEffect } from "react";

import { aplicarTemaAlDOM, leerTema } from "@/lib/tema";

export default function BotonTema() {
  const [montado, setMontado] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(false);

  useEffect(() => {
    const oscuro = leerTema() === "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemaOscuro(oscuro);
    setMontado(true);
  }, []);

  const alternarTema = () => {
    const nuevoEstado = !temaOscuro;
    setTemaOscuro(nuevoEstado);
    // Aplica clase .dark, data-theme, localStorage Y sincroniza <meta theme-color>.
    aplicarTemaAlDOM(nuevoEstado ? "dark" : "light");
  };

  return (
    <button
      onClick={alternarTema}
      type="button"
      className="inline-flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-text)] border border-[var(--color-border)] text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap shadow-xs cursor-pointer"
      aria-label={montado && temaOscuro ? "Cambiar a modo claro (papel prensa)" : "Cambiar a modo oscuro (carbón cálido)"}
      title={montado && temaOscuro ? "Modo Claro ☀️" : "Modo Oscuro 🌙"}
      suppressHydrationWarning
    >
      <span className="transition-transform duration-200 active:scale-90 select-none" suppressHydrationWarning>
        {montado ? (temaOscuro ? "☀️" : "🌙") : "🌙"}
      </span>
    </button>
  );
}
