"use client";

import { useSyncExternalStore } from "react";

/**
 * Acción de recuperación de `/~offline`.
 *
 * Solo hay una fuente de verdad externa (el estado de red del navegador), así
 * que se lee con `useSyncExternalStore` en vez de con un `useEffect` que haga
 * `setState` — evita el render extra y el aviso del linter `set-state-in-effect`.
 */

function suscribirseAlEstadoDeRed(alCambiar: () => void) {
  window.addEventListener("online", alCambiar);
  window.addEventListener("offline", alCambiar);
  return () => {
    window.removeEventListener("online", alCambiar);
    window.removeEventListener("offline", alCambiar);
  };
}

/** En servidor se asume "en línea": el HTML estático no debe prometer un estado falso. */
const SUSCRIPCION_SERVIDOR = () => true;

export default function BotonReintentarOffline() {
  const enLinea = useSyncExternalStore(
    suscribirseAlEstadoDeRed,
    () => navigator.onLine,
    SUSCRIPCION_SERVIDOR
  );

  const reintentar = () => {
    // Deliberado: hace falta una navegación de DOCUMENTO completa (no SPA) para
    // que el service worker pueda responder con la portada cacheada.
    // `useRouter().push()` haría un fetch RSC que, sin red, falla y deja al
    // usuario encallado en esta misma pantalla.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  };

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={reintentar}
        className="interactive-tap inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-bold tracking-wide text-[var(--color-bg)] transition-[filter,transform] duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
        Reintentar
      </button>

      <p
        aria-live="polite"
        className="mt-3 min-h-5 text-xs font-semibold tracking-wide text-[var(--color-muted)]"
      >
        {enLinea
          ? "Hay conexión de red: vuelve a intentarlo."
          : "Tu dispositivo sigue sin conexión."}
      </p>
    </div>
  );
}
