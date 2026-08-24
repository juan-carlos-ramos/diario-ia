"use client";
import { useEffect, useState } from "react";

export default function BotonTema() {
  const [temaOscuro, setTemaOscuro] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const temaGuardado = localStorage.getItem("diarioia_tema");
    if (temaGuardado === "dark") {
      setTemaOscuro(true);
      document.documentElement.classList.add("dark");
    } else {
      setTemaOscuro(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const alternarTema = () => {
    const nuevoEstado = !temaOscuro;
    setTemaOscuro(nuevoEstado);
    if (nuevoEstado) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("diarioia_tema", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("diarioia_tema", "light");
    }
  };

  if (!montado) {
    return (
      <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] opacity-60" />
    );
  }

  return (
    <button
      onClick={alternarTema}
      type="button"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-text)] border border-[var(--color-border)] text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap shadow-xs"
      aria-label={temaOscuro ? "Cambiar a modo claro (papel prensa)" : "Cambiar a modo oscuro (carbón cálido)"}
      title={temaOscuro ? "Modo Claro ☀️" : "Modo Oscuro 🌙"}
    >
      <span className="transition-transform duration-200 active:scale-90">
        {temaOscuro ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
