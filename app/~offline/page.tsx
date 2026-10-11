import type { Metadata } from "next";

import BotonReintentarOffline from "./BotonReintentarOffline";

/**
 * Fallback de navegación sin conexión (`/~offline`).
 *
 * Lo sirve el service worker (patrón `fallbacks.entries` de Serwist) cuando
 * una petición de documento falla y no hay copia en caché. Por eso es una
 * página **estática y autosuficiente**:
 *   · Cero `next/image` — el optimizador (`/_next/image`) es una respuesta de
 *     servidor y sin red puede quedar sin caché: aquí se usa la marca
 *     tipográfica (fuentes self-hosted de `next/font`, sí precacheadas).
 *   · Enlaces con `<a href>` (navegación completa de documento) y no `next/link`
 *     (navegación RSC por fetch): así el service worker puede responder con la
 *     copia cacheada de la ruta destino.
 *   · Sin animaciones de entrada: aparece cuando algo ha ido mal, sin ruido.
 *
 * Estética "The Modern Broadsheet": marfil / carbón / ámbar, reglas de
 * imprenta y jerarquía de serial. Todos los colores salen de los tokens OKLCH
 * de `app/globals.css` (`--color-*`), por lo que respeta el tema claro/oscuro
 * que fija el script `theme-bootstrap` del layout raíz.
 */

export const metadata: Metadata = {
  title: "Sin conexión",
  description:
    "No hay conexión con el servidor de DiarioIA. Vuelve a intentarlo o consulta las noticias guardadas en este dispositivo.",
  robots: { index: false, follow: false },
};

export default function SinConexion() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-5 py-14 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-xl">
        {/* Cabecera de imprenta */}
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-[var(--color-text)] pb-2.5">
          <span className="font-serif text-2xl sm:text-[1.75rem] font-black tracking-tight text-[var(--color-text)]">
            Diario
            <span className="text-[var(--color-accent)] italic ml-0.5">IA</span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-muted)] text-right">
            Edición sin conexión
          </span>
        </div>

        {/* Icono: onda inalámbrica tachada */}
        <svg
          className="mt-10 w-11 h-11 text-[var(--color-accent)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <path d="M12 20h.01" />
          <path d="m2 2 20 20" />
        </svg>

        <h1 className="mt-6 font-serif text-[2.1rem] sm:text-5xl font-bold leading-[1.08] tracking-tight text-[var(--color-text)]">
          Sin conexión
        </h1>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[var(--color-muted)] max-w-[46ch]">
          No pudimos contactar con el servidor de DiarioIA. Tus noticias guardadas siguen en
          este dispositivo y estarán aquí cuando vuelvas.
        </p>

        <BotonReintentarOffline />

        {/* Salida secundaria: nunca un callejón sin salida */}
        <p className="mt-6 pt-5 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
          También puedes abrir{" "}
          <a
            href="/guardados"
            className="font-bold text-[var(--color-text)] underline decoration-[var(--color-accent)] decoration-2 underline-offset-[3px] transition-colors hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] rounded-sm"
          >
            tus noticias guardadas
          </a>{" "}
          o comprobar tu conexión.
        </p>
      </div>
    </main>
  );
}
