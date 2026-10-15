"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Banner flotante de instalación PWA para DiarioIA ("The Modern Broadsheet").
 *
 * Estética Editorial de Élite:
 *  - Vidrio editorial: `bg-[var(--color-card)]/92 backdrop-blur-xl` con líneas finas de imprenta.
 *  - Tipografía de prensa: Newsreader (`font-serif`) con Plus Jakarta Sans.
 *  - Acento editorial: ámbar terracota OKLCH calibrado (`--color-accent` y `--color-on-accent`).
 *  - Físicas táctiles: `interactive-tap` con amortiguación crítica.
 *
 * Especificaciones funcionales:
 *  - Móvil: flotando abajo, justo encima de BottomNav (`bottom-[calc(env(safe-area-inset-bottom)+4.75rem)]`).
 *  - Escritorio: fijado con elegancia en la esquina inferior derecha (`sm:bottom-6 sm:right-6`).
 *  - Android/Chromium: captura `beforeinstallprompt`, lo almacena y lo ejecuta al pulsar "Instalar".
 *  - iOS/Safari: muestra una guía amigable ("Compartir ⎋ → Añadir a pantalla de inicio ➕").
 *  - Descarte: al pulsar ✕ guarda la fecha en `localStorage` (clave `diarioia_pwa_dismissed_until`)
 *    para no volver a molestar durante 7 días.
 *  - Standalone/Ya instalada: no renderiza nada (display-mode standalone o navigator.standalone).
 */

const CLAVE_DESCARTE = "diarioia_pwa_dismissed_until";
const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

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
  const iPadOS = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iPhoneLike || iPadOS;
}

function estaDescartada(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const valor = localStorage.getItem(CLAVE_DESCARTE);
    if (!valor) return false;
    const tiempo = Number(valor);
    return !Number.isNaN(tiempo) && tiempo > Date.now();
  } catch {
    return false;
  }
}

export default function BannerInstalarPWA() {
  const [montado, setMontado] = useState(false);
  const [instalada, setInstalada] = useState(false);
  const [puedeInstalar, setPuedeInstalar] = useState(false);
  const [descartado, setDescartado] = useState(false);
  const [guiaIOSAbierta, setGuiaIOSAbierta] = useState(false);

  const eventoRef = useRef<EventoInstalacion | null>(null);
  const contenedorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalada(estaInstalada());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDescartado(estaDescartada());
    setMontado(true);

    const alCapturarPrompt = (e: Event) => {
      e.preventDefault();
      eventoRef.current = e as EventoInstalacion;
      setPuedeInstalar(true);
    };

    const alInstalarConfirmado = () => {
      eventoRef.current = null;
      setPuedeInstalar(false);
      setInstalada(true);
      setGuiaIOSAbierta(false);
    };

    window.addEventListener("beforeinstallprompt", alCapturarPrompt);
    window.addEventListener("appinstalled", alInstalarConfirmado);

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const alCambiarModo = () => {
      if (estaInstalada()) setInstalada(true);
    };
    mq?.addEventListener?.("change", alCambiarModo);

    return () => {
      window.removeEventListener("beforeinstallprompt", alCapturarPrompt);
      window.removeEventListener("appinstalled", alInstalarConfirmado);
      mq?.removeEventListener?.("change", alCambiarModo);
    };
  }, []);

  // Cierra la guía de iOS con tecla Escape
  useEffect(() => {
    if (!guiaIOSAbierta) return;
    const alPulsarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGuiaIOSAbierta(false);
    };
    document.addEventListener("keydown", alPulsarTecla);
    return () => document.removeEventListener("keydown", alPulsarTecla);
  }, [guiaIOSAbierta]);

  const descartarAviso = useCallback(() => {
    try {
      const expira = Date.now() + SIETE_DIAS_MS;
      localStorage.setItem(CLAVE_DESCARTE, String(expira));
    } catch {
      // Ignorar errores en entornos con almacenamiento bloqueado
    }
    setDescartado(true);
    setGuiaIOSAbierta(false);
  }, []);

  const ejecutarInstalacion = useCallback(async () => {
    const evento = eventoRef.current;
    if (evento) {
      await evento.prompt();
      const eleccion = await evento.userChoice;
      eventoRef.current = null;
      setPuedeInstalar(false);
      if (eleccion.outcome === "accepted") {
        setInstalada(true);
      }
      return;
    }

    if (esIOS()) {
      setGuiaIOSAbierta((prev) => !prev);
    }
  }, []);

  if (!montado || instalada || descartado) return null;

  const modoIOS = !puedeInstalar && esIOS();
  if (!puedeInstalar && !modoIOS) return null;

  return (
    <aside
      ref={contenedorRef}
      aria-label="Aviso de instalación de DiarioIA"
      className="fixed z-40 transition-all duration-300 ease-out bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md sm:w-auto"
    >
      <div className="flex flex-col rounded-2xl sm:rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]/92 backdrop-blur-xl shadow-[0_12px_36px_oklch(13.5%_0.012_55_/_18%)] p-3 sm:p-3.5">
        <div className="flex items-center gap-3">
          {/* Emblema editorial de DiarioIA */}
          <Image
            src="/logo.png"
            alt="DiarioIA"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl object-cover border border-[var(--color-border)] shrink-0 shadow-xs"
          />

          {/* Textos con identidad de prensa independiente */}
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-sm font-black tracking-tight text-[var(--color-text)] font-serif truncate">
              Instalar Diario<span className="text-[var(--color-accent)] italic ml-0.5">IA</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--color-muted)] leading-tight truncate mt-0.5 font-sans">
              Acceso rápido y pantalla completa
            </p>
          </div>

          {/* Acciones: Instalar editorial y Descartar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={ejecutarInstalacion}
              aria-expanded={modoIOS ? guiaIOSAbierta : undefined}
              aria-haspopup={modoIOS ? "dialog" : undefined}
              className="bg-[var(--color-accent)] text-[var(--color-on-accent)] font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl interactive-tap shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)] transition-[filter,transform] duration-150 hover:brightness-105 active:scale-[0.98]"
            >
              Instalar
            </button>
            <button
              type="button"
              onClick={descartarAviso}
              aria-label="Descartar aviso de instalación"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] interactive-tap cursor-pointer active:scale-[0.98]"
            >
              <span aria-hidden="true" className="text-sm leading-none font-semibold">
                ✕
              </span>
            </button>
          </div>
        </div>

        {/* Guía editorial paso a paso para iOS */}
        {modoIOS && guiaIOSAbierta && (
          <div
            role="dialog"
            aria-label="Cómo instalar DiarioIA en iOS"
            className="mt-2.5 pt-2.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text)] flex items-start gap-2.5"
          >
            <span className="text-base leading-none select-none mt-0.5" aria-hidden="true">
              📲
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--color-text)] leading-snug">
                Toca <strong className="font-bold">Compartir</strong>{" "}
                <span className="text-[var(--color-accent)] font-bold" aria-hidden="true">
                  ⎋
                </span>{" "}
                y luego{" "}
                <strong className="font-bold">&apos;Añadir a pantalla de inicio&apos;</strong>{" "}
                <span className="text-[var(--color-accent)] font-bold" aria-hidden="true">
                  ➕
                </span>
              </p>
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5">
                Disponible en Safari (iOS 16.4 o superior).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGuiaIOSAbierta(false)}
              aria-label="Cerrar instrucciones de instalación"
              className="w-5 h-5 rounded flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-card-hover)] text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] interactive-tap cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
