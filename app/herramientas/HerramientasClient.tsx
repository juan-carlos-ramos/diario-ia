"use client";
import { useState, useMemo } from "react";
import { HerramientaIA, CategoriaHerramienta } from "@/lib/herramientas";

interface Props {
  herramientasIniciales: HerramientaIA[];
  categorias: { id: CategoriaHerramienta; nombre: string; icono: string }[];
}

export default function HerramientasClient({ herramientasIniciales, categorias }: Props) {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaHerramienta>("todos");
  const [busqueda, setBusqueda] = useState("");

  const herramientasFiltradas = useMemo(() => {
    return herramientasIniciales.filter((h) => {
      const coincideCategoria = categoriaActiva === "todos" || h.categoria === categoriaActiva;
      const coincideBusqueda =
        busqueda.trim() === "" ||
        h.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        h.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [herramientasIniciales, categoriaActiva, busqueda]);

  const badgeColor = (precio: string) => {
    switch (precio) {
      case "Gratis":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Open Source":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "Freemium":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div>
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Selector de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all interactive-tap ${
                categoriaActiva === cat.id
                  ? "bg-[var(--color-accent)] text-black shadow-[0_2px_12px_oklch(76%_0.19_200_/_25%)]"
                  : "bg-[var(--color-card)] text-[var(--color-muted)] hover:text-white border border-[var(--color-border)]"
              }`}
            >
              <span>{cat.icono}</span>
              <span>{cat.nombre}</span>
            </button>
          ))}
        </div>

        {/* Buscador de Herramientas */}
        <div className="relative w-full md:w-72 flex-shrink-0">
          <input
            type="text"
            placeholder="Buscar herramienta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 pl-9 bg-[var(--color-card)] border border-[var(--color-border)] rounded-full text-xs text-white placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
          />
          <span className="absolute left-3 top-2.5 text-xs text-[var(--color-muted)]">🔍</span>
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-2.5 text-xs text-[var(--color-muted)] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid de Herramientas */}
      {herramientasFiltradas.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-card)] rounded-[24px] border border-[var(--color-border)]">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-white mt-3">No se encontraron herramientas</h3>
          <p className="text-xs text-[var(--color-muted)] mt-1">Prueba cambiando los términos de búsqueda o de categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {herramientasFiltradas.map((herramienta) => (
            <div
              key={herramienta.id}
              className="flex flex-col justify-between p-6 rounded-[20px] bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.2)] group"
            >
              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[oklch(16%_0.015_200)] border border-[oklch(24%_0.02_200)] flex items-center justify-center text-2xl shadow-inner">
                    {herramienta.icono}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor(herramienta.precio)}`}>
                    {herramienta.precio}
                  </span>
                </div>

                {/* Nombre y descripción */}
                <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
                  {herramienta.nombre}
                </h3>
                <p className="text-xs text-[var(--color-muted)] mt-2 leading-relaxed">
                  {herramienta.descripcion}
                </p>
              </div>

              {/* Botón enlace externo */}
              <div className="mt-6 pt-4 border-t border-[oklch(15%_0.008_200)] flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)]">
                  {herramienta.categoria.replace("-", " ")}
                </span>
                <a
                  href={herramienta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[oklch(18%_0.015_200)] hover:bg-[var(--color-accent)] text-[var(--color-text)] hover:text-black text-xs font-bold transition-all interactive-tap"
                  aria-label={`Abrir sitio de ${herramienta.nombre}`}
                >
                  Probar ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
