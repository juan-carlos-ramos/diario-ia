"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFavoritos } from "@/lib/favoritos";

const ITEMS = [
  { href: "/", icono: "⊞", etiqueta: "Inicio" },
  { href: "/?categoria=tecnologia", icono: "◈", etiqueta: "Tecnología" },
  { href: "/?categoria=productividad", icono: "◎", etiqueta: "Trabajo" },
  { href: "/guardados", icono: "🔖", etiqueta: "Guardados" },
  { href: "https://t.me/diariodeia", icono: "✈", etiqueta: "Telegram", externo: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoriaActual = searchParams.get("categoria") ?? "";
  const { totalFavoritos, montado } = useFavoritos();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[oklch(10%_0.008_200_/_90%)] backdrop-blur-lg border-t border-[var(--color-border)] px-3 py-2 pb-5"
      aria-label="Navegación principal móvil"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {ITEMS.map((item) => {
          // Determinar estado activo de forma precisa
          let activo = false;
          if (!item.externo) {
            if (item.href === "/guardados") {
              activo = pathname === "/guardados";
            } else if (pathname === "/") {
              if (item.href === "/") {
                activo = categoriaActual === "";
              } else if (item.href.includes("categoria=tecnologia")) {
                activo = categoriaActual === "tecnologia";
              } else if (item.href.includes("categoria=productividad")) {
                activo = categoriaActual === "productividad";
              }
            }
          }

          if (item.externo) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-[var(--color-muted)] active:text-[var(--color-accent)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap"
                aria-label={item.etiqueta}
              >
                <span className="text-base leading-none">{item.icono}</span>
                <span className="text-[10px] font-bold tracking-wide">{item.etiqueta}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1.5 px-2.5 py-1.5 rounded-2xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap ${
                activo
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)]"
              }`}
              aria-label={item.etiqueta}
              aria-current={activo ? "page" : undefined}
            >
              <span className="text-base leading-none relative">
                {item.icono}
                {item.href === "/guardados" && montado && totalFavoritos > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-1 text-[9px] font-black rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center">
                    {totalFavoritos}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-bold tracking-wide">{item.etiqueta}</span>

              {/* Micro-indicador brillante de pestaña activa */}
              {activo && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


