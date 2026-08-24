"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface ResultadoBusqueda {
  id: string;
  tipo: "noticia" | "herramienta";
  titulo: string;
  url: string;
  badge?: string;
  categoria?: string;
}

const TEMAS_POPULARES = [
  "OpenAI",
  "Claude",
  "Gemini",
  "DeepSeek",
  "Vibe Coding",
  "Robótica",
  "Cursor",
  "Lovable",
];

export default function BuscadorModal() {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);
  const [noticias, setNoticias] = useState<any[]>([]);
  const [herramientas, setHerramientas] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Cerrar el modal automáticamente al cambiar de pestaña o ruta
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

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
      }, 60);
      setQuery("");
      setIndiceSeleccionado(0);
    }
  }, [abierto]);

  // Filtrar resultados de forma minimalista solo cuando el usuario escribe
  const resultados: ResultadoBusqueda[] = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const q = query.toLowerCase();

    const notMatch: ResultadoBusqueda[] = noticias
      .filter(
        (n) =>
          n.titulo?.toLowerCase().includes(q) ||
          n.resumen?.toLowerCase().includes(q) ||
          n.tags?.some((t: string) => t.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map((n) => ({
        id: `n-${n.id}`,
        tipo: "noticia",
        titulo: n.titulo,
        url: `/noticia/${n.id}`,
        badge: n.fuente,
        categoria: n.categoria,
      }));

    const herMatch: ResultadoBusqueda[] = herramientas
      .filter(
        (h) =>
          h.nombre?.toLowerCase().includes(q) ||
          h.descripcion?.toLowerCase().includes(q) ||
          h.categoria?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((h) => ({
        id: `h-${h.id}`,
        tipo: "herramienta",
        titulo: h.nombre,
        url: "/herramientas",
        badge: h.precio,
        categoria: "Herramienta",
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
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-24 p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={() => setAbierto(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Buscador global"
    >
      <div
        className="w-full max-w-xl bg-[var(--color-card)] border-t sm:border border-[var(--color-border)] rounded-t-[28px] sm:rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-200 pb-[max(12px,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de arrastre en móvil */}
        <div className="sm:hidden w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-1" />

        {/* Input de Búsqueda Minimalista */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)]">
          <span className="text-base text-[var(--color-accent)] flex-shrink-0">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribe para buscar noticias o herramientas..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndiceSeleccionado(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent text-sm sm:text-base text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] px-1.5 py-0.5 rounded-full"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setAbierto(false)}
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-xs text-[var(--color-muted)] active:text-[var(--color-text)] interactive-tap"
            aria-label="Cerrar buscador"
          >
            ✕
          </button>
        </div>

        {/* Contenido: Si está vacío muestra sugerencias rápidas en chips; si escribe muestra resultados limpios */}
        <div className="overflow-y-auto p-4 flex-1">
          {!query.trim() ? (
            <div className="py-4">
              <span className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider block mb-3">
                Temas y herramientas populares:
              </span>
              <div className="flex flex-wrap gap-2">
                {TEMAS_POPULARES.map((tema) => (
                  <button
                    key={tema}
                    onClick={() => {
                      setQuery(tema);
                      setIndiceSeleccionado(0);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-accent)] hover:text-white text-[var(--color-text)] border border-[var(--color-border)] text-xs font-semibold tracking-wide transition-all interactive-tap"
                  >
                    #{tema}
                  </button>
                ))}
              </div>
            </div>
          ) : resultados.length === 0 ? (
            <div className="py-10 text-center text-xs text-[var(--color-muted)]">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {resultados.map((item, idx) => (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setAbierto(false)}
                  onMouseEnter={() => setIndiceSeleccionado(idx)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all interactive-tap ${
                    indiceSeleccionado === idx
                      ? "bg-[var(--color-surface)] border border-[var(--color-border-hover)] text-[var(--color-text)]"
                      : "hover:bg-[var(--color-surface)] border border-transparent text-[var(--color-text)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm flex-shrink-0">
                      {item.tipo === "herramienta" ? "🛠️" : "📰"}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold truncate">
                      {item.titulo}
                    </h4>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[var(--color-accent)] border border-[var(--color-border)] flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Minimalista */}
        <div className="px-5 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
          <span className="hidden sm:inline">Usa ↑↓ para navegar y Enter para abrir</span>
          <span className="text-[10px] text-[var(--color-muted)] sm:ml-auto">DiarioIA Search</span>
        </div>
      </div>
    </div>
  );
}
