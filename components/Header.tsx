"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavoritos } from "@/lib/favoritos";

export default function Header() {
  const pathname = usePathname();
  const { totalFavoritos, montado } = useFavoritos();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg)]/90 backdrop-blur-lg border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded-lg interactive-tap group"
        >
          <Image
            src="/logo.png"
            alt="DiarioIA logo"
            width={30}
            height={30}
            className="rounded-full border border-[var(--color-border)]"
          />
          <span className="text-xl font-black tracking-tight text-[var(--color-text)] font-serif">
            Diario<span className="text-[var(--color-accent)] italic font-serif ml-0.5 font-black">IA</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón Buscador Cmd+K */}
          <button
            onClick={() => window.dispatchEvent(new Event("diarioia_abrir_buscador"))}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap shadow-xs"
            aria-label="Abrir buscador global"
          >
            <span className="text-xs">🔍</span>
            <span className="hidden md:inline">Buscar</span>
            <kbd className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-[var(--color-muted)]">
              ⌘K
            </kbd>
          </button>

          {/* Enlace a Herramientas */}
          <Link
            href="/herramientas"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap ${
              pathname === "/herramientas"
                ? "bg-[var(--color-accent)] text-white font-extrabold shadow-[0_2px_12px_oklch(54%_0.17_50_/_20%)]"
                : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
            aria-label="Ver directorio de herramientas de IA"
          >
            <span>🛠️</span>
            <span className="hidden sm:inline">Herramientas</span>
          </Link>

          {/* Enlace a Guardados en Desktop */}
          <Link
            href="/guardados"
            className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap ${
              pathname === "/guardados"
                ? "bg-[var(--color-accent)] text-white font-extrabold shadow-[0_2px_12px_oklch(54%_0.17_50_/_20%)]"
                : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            }`}
            aria-label="Ver noticias guardadas"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill={pathname === "/guardados" ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Guardados</span>
            {montado && totalFavoritos > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-[var(--color-accent)] text-white font-extrabold">
                {totalFavoritos}
              </span>
            )}
          </Link>

          {/* Botón Telegram */}
          <a
            href="https://t.me/diariodeia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs sm:text-sm font-semibold rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap shadow-xs"
            aria-label="Unirse al canal de Telegram de DiarioIA"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
            </svg>
            <span className="hidden sm:inline">Únete al canal</span>
            <span className="sm:hidden">Telegram</span>
          </a>
        </div>
      </div>
    </header>
  );
}

