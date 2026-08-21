"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavoritos } from "@/lib/favoritos";

export default function Header() {
  const pathname = usePathname();
  const { totalFavoritos, montado } = useFavoritos();

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-[#222222]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] rounded-lg interactive-tap"
        >
          <Image
            src="/logo.png"
            alt="DiarioIA logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            Diario<span className="text-[#00E5FF]">IA</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Enlace a Guardados en Desktop */}
          <Link
            href="/guardados"
            className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] interactive-tap ${
              pathname === "/guardados"
                ? "bg-[oklch(76%_0.19_200_/_20%)] text-[#00E5FF] border border-[#00E5FF]"
                : "bg-[oklch(15%_0.008_200)] text-[var(--color-muted)] hover:text-white border border-[var(--color-border)]"
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
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-[#00E5FF] text-black font-extrabold">
                {totalFavoritos}
              </span>
            )}
          </Link>

          {/* Botón Telegram */}
          <a
            href="https://t.me/diariodeia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[#00E5FF] text-[#00E5FF] text-sm font-medium rounded-full hover:bg-[#00E5FF] hover:text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-black interactive-tap"
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

