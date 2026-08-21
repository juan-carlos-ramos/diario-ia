"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatearFecha } from "@/lib/utils";

interface ResultadoBusqueda {
  id: string;
  tipo: "noticia" | "herramienta";
  titulo: string;
  descripcion: string;
  url: string;
  extra?: string;
}

export default function BuscadorModal() {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);
  const [noticias, setNoticias] = useState<any[]>([]);
  const [herramientas, setHerramientas] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cargar datos de búsqueda una vez
  useEffect(() => {
    async function cargarDatos() {
      try {
        const res = await fetch("/api/buscar");
        if (res.ok) {
          const data = await res.json();
          setNoticias(data.noticias || []);
          setHerramientas(data.herramientas || []);
        }
      } catch (e) {
        // Fallback silencioso
      }
    }
    cargarDatos();
  }, []);

  // Escuchar atajo de teclado Cmd+K / Ctrl+K y eventos personalizados
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto((prev) => !prev);
      } else if (e.key === "Escape" && abierto) {
        setAbierto(false);
      }
    };

    const handleAbrirEvento = () => {
      setAbierto(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("diarioia_abrir_buscador", handleAbrirEvento);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("diarioia_abrir_buscador", handleAbrirEvento);
    };
  }, [abierto]);

  // Enfocar input al abrir
  useEffect(() => {
    if (abierto) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery("");
      setIndiceSeleccionado(0);
    }
  }, [abierto]);

  // Filtrar resultados
  const resultados: ResultadoBusqueda[] = useMemo(() => {
    if (!query.trim()) {
      // Sugerencias por defecto: herramientas destacadas + últimas noticias
      const sugerenciasHerramientas: ResultadoBusqueda[] = herramientas.slice(0, 3).map((h) => ({
        id: `h-${h.id}`,
        tipo: "herramienta",
        titulo: h.nombre,
        descripcion: h.descripcion,
        url: "/herramientas",
        extra: h.precio,
      }));

      const sugerenciasNoticias: ResultadoBusqueda[] = noticias.slice(0, 4).map((n) => ({
        id: `n-${n.id}`,
        tipo: "noticia",
        titulo: n.titulo,
        descripcion: n.resumen,
        url: `/noticia/${n.id}`,
        extra: n.fuente,
      }));

      return [...sugerenciasHerramientas, ...sugerenciasNoticias];
    }

    const q = query.toLowerCase();

    const notMatch: ResultadoBusqueda[] = noticias
      .filter((n) => n.titulo?.toLowerCase().includes(q) || n.resumen?.toLowerCase().includes(q) || n.tags?.some((t: string) => t.toLowerCase().includes(q)))
      .slice(0, 6)
      .map((n) => ({
        id: `n-${n.id}`,
        tipo: "noticia",
        titulo: n.titulo,
        descripcion: n.resumen,
        url: `/noticia/${n.id}`,
        extra: `${n.fuente} · ${formatearFecha(n.fechaPublicacion)}`,
      }));

    const herMatch: ResultadoBusqueda[] = herramientas
      .filter((h) => h.nombre?.toLowerCase().includes(q) || h.descripcion?.toLowerCase().includes(q) || h.categoria?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((h) => ({
        id: `h-${h.id}`,
        tipo: "herramienta",
        titulo: h.nombre,
        descripcion: h.descripcion,
        url: "/herramientas",
        extra: h.precio,
      }));

    return [...herMatch, ...notMatch];
  }, [query, noticias, herramientas]);

  // Manejar teclado en la lista de resultados
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (resultados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSeleccionado((prev) => (prev + 1) % resultados.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSeleccionado((prev) => (prev - 1 + resultados.length) % resultados.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const seleccionado = resultados[indiceSeleccionado];
      if (seleccionado) {
        setAbierto(false);
        router.push(seleccionado.url);
      }
    }
  };

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-24 p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity"
      onClick={() => setAbierto(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Buscador global"
    >
      <div
        className="w-full max-w-2xl bg-[var(--color-card)] border-t sm:border border-[oklch(26%_0.02_200)] rounded-t-[28px] sm:rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200 pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de arrastre en móvil */}
        <div className="sm:hidden w-12 h-1.5 bg-[oklch(25%_0.01_200)] rounded-full mx-auto mt-3 mb-1" />

        {/* Barra de entrada de búsqueda */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)]">
          <span className="text-lg text-[var(--color-accent)] flex-shrink-0">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar noticias, temas (#OpenAI) o herramientas..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndiceSeleccionado(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-[var(--color-muted)] focus:outline-none"
          />
          {/* Botón Cerrar táctil en móvil */}
          <button
            onClick={() => setAbierto(false)}
            className="sm:hidden flex-shrink-0 w-8 h-8 rounded-full bg-[oklch(18%_0.01_200)] flex items-center justify-center text-xs text-[var(--color-muted)] active:text-white"
            aria-label="Cerrar buscador"
          >
            ✕
          </button>
          <kbd className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 bg-[oklch(16%_0.01_200)] border border-[var(--color-border)] rounded-md text-[var(--color-muted)]">
            ESC
          </kbd>
        </div>

        {/* Lista de resultados */}
        <div className="overflow-y-auto p-3 space-y-1 flex-1">
          {resultados.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--color-muted)]">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : (
            resultados.map((item, idx) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setAbierto(false)}
                onMouseEnter={() => setIndiceSeleccionado(idx)}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  indiceSeleccionado === idx
                    ? "bg-[oklch(18%_0.02_200)] border border-[oklch(28%_0.03_200)]"
                    : "hover:bg-[oklch(14%_0.01_200)] border border-transparent"
                }`}
              >
                <span className="text-base mt-0.5">
                  {item.tipo === "herramienta" ? "🛠️" : "📰"}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {item.titulo}
                    </h4>
                    {item.extra && (
                      <span className="text-[10px] font-medium text-[var(--color-accent)] flex-shrink-0">
                        {item.extra}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-muted)] line-clamp-1 mt-0.5">
                    {item.descripcion}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer del modal con atajos */}
        <div className="px-5 py-3 border-t border-[var(--color-border)] bg-[oklch(10%_0.008_200)] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navegar</span>
            <span>↵ Abrir</span>
            <span>ESC Cerrar</span>
          </div>
          <span className="text-[10px] text-[oklch(75%_0.02_200)]">DiarioIA Search</span>
        </div>
      </div>
    </div>
  );
}
