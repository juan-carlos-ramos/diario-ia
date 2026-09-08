"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import type { Noticia } from "./noticias";

const STORAGE_KEY = "diarioia_favoritos_v1";
const EVENT_NAME = "diarioia_favoritos_updated";

let cacheFavoritos: Noticia[] = [];
let cacheRaw: string | null = null;

/**
 * Obtiene todas las noticias guardadas desde localStorage con caché de referencia
 */
export function obtenerFavoritos(): Noticia[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cacheFavoritos = [];
      cacheRaw = null;
      return cacheFavoritos;
    }
    if (raw === cacheRaw) {
      return cacheFavoritos;
    }
    cacheRaw = raw;
    cacheFavoritos = JSON.parse(raw) as Noticia[];
    return cacheFavoritos;
  } catch {
    return [];
  }
}

/**
 * Guarda una noticia en favoritos
 */
export function guardarFavorito(noticia: Noticia): void {
  if (typeof window === "undefined") return;
  try {
    const actuales = obtenerFavoritos();
    if (!actuales.some((n) => n.id === noticia.id)) {
      const actualizados = [noticia, ...actuales];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
      window.dispatchEvent(new Event(EVENT_NAME));
    }
  } catch {
    // Fallback silencioso
  }
}

/**
 * Elimina una noticia de favoritos por su ID
 */
export function eliminarFavorito(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const actuales = obtenerFavoritos();
    const actualizados = actuales.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // Fallback silencioso
  }
}

/**
 * Verifica si una noticia está guardada en favoritos
 */
export function esFavorito(id: string): boolean {
  if (typeof window === "undefined") return false;
  const actuales = obtenerFavoritos();
  return actuales.some((n) => n.id === id);
}

/**
 * Alterna el estado de favorito (si existe lo quita, si no lo añade)
 * Retorna true si fue agregado, false si fue removido
 */
export function alternarFavorito(noticia: Noticia): boolean {
  if (esFavorito(noticia.id)) {
    eliminarFavorito(noticia.id);
    return false;
  } else {
    guardarFavorito(noticia);
    return true;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

const emptyFavoritos: Noticia[] = [];
function getServerSnapshot(): Noticia[] {
  return emptyFavoritos;
}

/**
 * Hook reactivo para sincronizar favoritos garantizando 100% de coincidencia con SSR (cero errores de hidratación)
 */
export function useFavoritos() {
  const [montado, setMontado] = useState(false);
  const storeFavoritos = useSyncExternalStore(subscribe, obtenerFavoritos, getServerSnapshot);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);
  }, []);

  const favoritos = montado ? storeFavoritos : emptyFavoritos;
  const totalFavoritos = montado ? storeFavoritos.length : 0;

  const toggle = (noticia: Noticia) => {
    return alternarFavorito(noticia);
  };

  const checkEsFavorito = (id: string) => {
    if (!montado) return false;
    return storeFavoritos.some((n) => n.id === id);
  };

  return {
    favoritos,
    totalFavoritos,
    montado,
    toggle,
    esFavorito: checkEsFavorito,
    eliminar: eliminarFavorito,
  };
}
