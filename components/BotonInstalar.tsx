"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Botón "Instalar DiarioIA".
 *
 * Poka-Yoke de instalabilidad:
 *  · Android/Chrome y Chrome/Edge de escritorio → captura `beforeinstallprompt`,
 *    lo GUARDA y solo lo dispara tras un gesto explícito del usuario.
 *  · iOS/Safari (no existe `beforeinstallprompt`) → muestra la guía manual
 *    "Compartir → Añadir a pantalla de inicio".
 *  · Si la app ya está instalada (display-mode standalone o navigator.standalone)
 *    o no hay ninguna vía de instalación disponible, NO se renderiza nada:
 *    nunca se muestra un botón muerto ni un callejón sin salida.
 */

/** Subconjunto tipado de BeforeInstallPromptEvent (no está en lib.dom.d.ts). */
interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function estaInstalada(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || iosStandalone;
}

function esIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iPhoneLike = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ se identifica como "MacIntel": se desambigua por puntos táctiles.
  const iPadOS = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iPhoneLike || iPadOS;
}

export default function BotonInstalar() {
  const [montado, setMontado] = useState(false);
  const [instalada, setInstalada] = useState(false);
  const [puedeInstalar, setPuedeInstalar] = useState(false);
  const [guiaAbierta, setGuiaAbierta] = useState(false);

  const eventoRef = useRef<EventoInstalacion | null>(null);
  const botonRef = useRef<HTMLButtonElement | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalada(estaInstalada());
    setMontado(true);

    const alInstalar = (e: Event) => {
      e.preventDefault(); // evita el mini-infobar; el prompt lo controlamos nosotros
      eventoRef.current = e as EventoInstalacion;
      setPuedeInstalar(true);
    };
    const alInstalarOk = () => {
      eventoRef.current = null;
      setPuedeInstalar(false);
      setInstalada(true);
      setGuiaAbierta(false);
    };

    window.addEventListener("beforeinstallprompt", alInstalar);
    window.addEventListener("appinstalled", alInstalarOk);

    // Reacciona si la app pasa a modo standalone por otra vía (menú del navegador).
    const mq = window.matchMedia?.("(display-mode: standalone)");
    const alCambiarModo = () => {
      if (estaInstalada()) setInstalada(true);
    };
    mq?.addEventListener?.("change", alCambiarModo);

    return () => {
      window.removeEventListener("beforeinstallprompt", alInstalar);
      window.removeEventListener("appinstalled", alInstalarOk);
      mq?.removeEventListener?.("change", alCambiarModo);
    };
  }, []);

  // Cierra la guía con Escape y devuelve el foco al botón (patrón disclosure).
  useEffect(() => {
    if (!guiaAbierta) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGuiaAbierta(false);
        botonRef.current?.focus();
      }
    };
    const alPuntero = (e: PointerEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setGuiaAbierta(false);
    };
    document.addEventListener("keydown", alPulsar);
    document.addEventListener("pointerdown", alPuntero);
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.removeEventListener("pointerdown", alPuntero);
    };
  }, [guiaAbierta]);

  const instalar = useCallback(async () => {
    const evento = eventoRef.current;
    if (!evento) return;
    await evento.prompt();
    const eleccion = await evento.userChoice;
    // El evento es de un solo uso: se consume en cualquier caso.
    eventoRef.current = null;
    setPuedeInstalar(false);
    if (eleccion.outcome === "accepted") {
      setInstalada(true);
    }
  }, []);

  if (!montado || instalada) return null;

  const modoIOS = !puedeInstalar && esIOS();
  if (!puedeInstalar && !modoIOS) return null;

  const etiqueta = modoIOS
    ? "Cómo instalar DiarioIA en el iPhone o iPad"
    : "Instalar DiarioIA como aplicación";

  return (
    <div ref={contenedorRef} className="relative">
      <button
        ref={botonRef}
        type="button"
        onClick={modoIOS ? () => setGuiaAbierta((v) => !v) : instalar}
        aria-label={etiqueta}
        aria-haspopup={modoIOS ? "dialog" : undefined}
        aria-expanded={modoIOS ? guiaAbierta : undefined}
        title="Instalar DiarioIA"
        className="inline-flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-8 sm:px-3 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-card-hover)] text-[var(--color-text)] border border-[var(--color-border)] text-xs font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap shadow-xs cursor-pointer"
      >
        <svg
          className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[var(--color-accent)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M4 20h16" />
        </svg>
        <span className="hidden sm:inline">Instalar</span>
      </button>

      {modoIOS && guiaAbierta && (
        <div
          role="dialog"
          aria-label="Cómo instalar DiarioIA en iOS"
          className="absolute right-0 top-[calc(100%+0.6rem)] z-[60] w-[16.5rem] rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-[0_10px_30px_oklch(13.5%_0.012_55_/_22%)] p-3.5 text-left"
        >
          <div className="flex items-start gap-2.5">
            <svg
              className="mt-0.5 w-4 h-4 shrink-0 text-[var(--color-accent)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V4" />
              <path d="m8 8 4-4 4 4" />
              <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
            </svg>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-text)]">
                Instalar en iOS
              </p>
              <ol className="mt-1.5 space-y-1 text-xs leading-relaxed text-[var(--color-text)]">
                <li>
                  1. Toca <strong className="font-bold">Compartir</strong> en Safari.
                </li>
                <li>
                  2. Elige <strong className="font-bold">Añadir a pantalla de inicio</strong>.
                </li>
              </ol>
              <p className="mt-2 text-[10px] leading-snug text-[var(--color-text)]">
                Disponible en Safari (iOS 16.4 o superior).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setGuiaAbierta(false);
              botonRef.current?.focus();
            }}
            aria-label="Cerrar instrucciones de instalación"
            className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-[var(--color-text)] hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] interactive-tap cursor-pointer"
          >
            <span aria-hidden="true" className="text-[11px] leading-none">
              ✕
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
