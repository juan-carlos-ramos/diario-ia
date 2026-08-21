"use client";
import { useState, useEffect } from "react";
import type { Noticia } from "./noticias";

const STORAGE_KEY = "diarioia_favoritos_v1";
const EVENT_NAME = "diarioia_favoritos_updated";

/**
 * Obtiene todas las noticias guardadas desde localStorage
 */
export function obtenerFavoritos(): Noticia[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Noticia[];
  } catch (error) {
    console.error("Error al leer favoritos de localStorage:", error);
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
  } catch (error) {
    console.error("Error al guardar favorito:", error);
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
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
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

/**
 * Hook reactivo para consumir y sincronizar favoritos en tiempo real
 */
export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<Noticia[]>([]);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    setFavoritos(obtenerFavoritos());

    const handleUpdate = () => {
      setFavoritos(obtenerFavoritos());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggle = (noticia: Noticia) => {
    return alternarFavorito(noticia);
  };

  const checkEsFavorito = (id: string) => {
    if (!montado) return false;
    return favoritos.some((n) => n.id === id);
  };

  return {
    favoritos,
    totalFavoritos: favoritos.length,
    montado,
    toggle,
    esFavorito: checkEsFavorito,
    eliminar: eliminarFavorito,
  };
}
