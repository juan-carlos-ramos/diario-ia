"use client";

import { useSerwist } from "@serwist/turbopack/react";
import { useCallback, useEffect } from "react";

import { useFavoritos } from "@/lib/favoritos";

/**
 * Precarga en el service worker los artículos guardados en favoritos.
 *
 * Los favoritos viven en `localStorage`, así que el SW no puede conocerlos por
 * su cuenta. Este puente usa el mensaje `CACHE_URLS`, que Serwist atiende de
 * serie (`Serwist.handleCache`): cada URL pasa por las rutas registradas y
 * acaba en la caché Network-First de documentos. Resultado: un artículo
 * guardado se puede leer sin conexión aunque el precache no lo incluya.
 *
 * No pinta nada (devuelve `null`); es infraestructura.
 */
const MAXIMO_URLS = 60;

export default function CachearGuardadosOffline() {
  const { serwist } = useSerwist();
  const { favoritos, montado } = useFavoritos();

  const precargar = useCallback(() => {
    if (!serwist || !montado || favoritos.length === 0) return;
    // Sin red no hay nada que descargar; al volver, el evento `online` reintenta.
    if (typeof navigator === "undefined" || !navigator.onLine) return;

    const urls = Array.from(new Set(favoritos.map((noticia) => `/noticia/${noticia.id}`))).slice(
      0,
      MAXIMO_URLS
    );

    // `messageSW` resuelve solo si el SW responde por puerto; el mensaje es
    // "dispara y olvida" a propósito.
    void serwist.messageSW({ type: "CACHE_URLS", payload: { urlsToCache: urls } });
  }, [serwist, montado, favoritos]);

  useEffect(() => {
    precargar();
    window.addEventListener("online", precargar);
    return () => window.removeEventListener("online", precargar);
  }, [precargar]);

  return null;
}
