"use client";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return typeof window !== "undefined" && localStorage.getItem("diarioia_tema") === "dark";
}

function getServerSnapshot() {
  return false;
}

export default function BotonTema() {
  const temaOscuro = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const alternarTema = () => {
    const nuevoEstado = !temaOscuro;
    if (nuevoEstado) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("diarioia_tema", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("diarioia_tema", "light");
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      onClick={alternarTema}
      type="button"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-text)] border border-[var(--color-border)] text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap shadow-xs cursor-pointer"
      aria-label={temaOscuro ? "Cambiar a modo claro (papel prensa)" : "Cambiar a modo oscuro (carbón cálido)"}
      title={temaOscuro ? "Modo Claro ☀️" : "Modo Oscuro 🌙"}
    >
      <span className="transition-transform duration-200 active:scale-90 select-none">
        {temaOscuro ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
