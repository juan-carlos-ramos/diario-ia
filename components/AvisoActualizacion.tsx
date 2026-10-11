"use client";

import { useSerwist } from "@serwist/turbopack/react";
import { useEffect, useRef, useState } from "react";

/**
 * Aviso de actualización del service worker.
 *
 * El SW se configura con `skipWaiting: false`: cuando se publica una versión
 * nueva, se queda en estado `waiting` en lugar de reclamar la pestaña a la
 * fuerza. Eso evita el escenario clásico de "pestaña zombi": activar de golpe
 * purga el precache antiguo y una pestaña abierta puede pedir un chunk
 * hasheado que ya no existe → pantalla rota a mitad de lectura.
 *
 * Aquí se le dice al usuario que hay versión nueva y solo si pulsa "Actualizar
 * ahora" se envía `SKIP_WAITING` y se recarga al tomar el control
 * (`controllerchange`). La recarga NO se dispara si el cambio de controlador
 * viene del primer reclamo (`clientsClaim`), para no entrar en bucle.
 */
export default function AvisoActualizacion() {
  const { serwist } = useSerwist();
  const [hayActualizacion, setHayActualizacion] = useState(false);
  const [descartado, setDescartado] = useState(false);
  const activacionPedida = useRef(false);

  useEffect(() => {
    if (!serwist) return;

    const alEsperar = () => setHayActualizacion(true);
    const alCambiarControlador = () => {
      if (activacionPedida.current) window.location.reload();
    };

    serwist.addEventListener("waiting", alEsperar);
    navigator.serviceWorker?.addEventListener("controllerchange", alCambiarControlador);

    // Un SW pudo quedar "waiting" antes de que este componente se montara
    // (el evento ya se habría emitido y perdido): se consulta el registro.
    void navigator.serviceWorker
      ?.getRegistration()
      .then((registro) => {
        if (registro?.waiting) setHayActualizacion(true);
      })
      .catch(() => {
        /* sin registro no hay nada que avisar */
      });

    return () => {
      serwist.removeEventListener("waiting", alEsperar);
      navigator.serviceWorker?.removeEventListener("controllerchange", alCambiarControlador);
    };
  }, [serwist]);

  const visible = hayActualizacion && !descartado;

  return (
    /* La región viva vive siempre en el DOM para que los lectores de pantalla
       anuncien el cambio cuando aparezca el aviso. */
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:justify-end sm:px-6 sm:pb-6"
    >
      {visible && (
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[0_16px_40px_oklch(13.5%_0.012_55_/_22%)]">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text)]">
                Nueva versión lista
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                Actualiza para cargar las últimas noticias y mejoras.
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2 pl-7">
            <button
              type="button"
              onClick={() => {
                activacionPedida.current = true;
                serwist?.messageSkipWaiting();
              }}
              className="interactive-tap inline-flex items-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-bold tracking-wide text-[var(--color-on-accent)] transition-[filter,transform] duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)]"
            >
              Actualizar ahora
            </button>
            <button
              type="button"
              onClick={() => setDescartado(true)}
              className="interactive-tap inline-flex items-center rounded-full border border-[var(--color-border)] px-3.5 py-2 text-xs font-bold tracking-wide text-[var(--color-muted)] transition-colors duration-150 hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
