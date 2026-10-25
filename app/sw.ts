/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/turbopack/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, Serwist } from "serwist";

/**
 * Service Worker de DiarioIA (Fase 3 · modo offline).
 *
 * Se compila con esbuild desde el Route Handler `app/serwist/[path]/route.ts`
 * (patrón oficial de Serwist para Turbopack) y se sirve en `/serwist/sw.js`.
 */

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const TREINTA_DIAS_EN_SEGUNDOS = 30 * 24 * 60 * 60;

/**
 * Rutas del "app shell" que se calientan en la caché de navegación tras la
 * activación (ver más abajo). Son la portada y la página de guardados: las dos
 * pantallas que un lector necesita poder abrir sin conexión desde el minuto uno.
 */
const APP_SHELL = ["/", "/guardados"] as const;

/**
 * Reglas propias del proyecto. Se colocan ANTES de `defaultCache` porque
 * Serwist resuelve el primer `matcher` que coincide y `defaultCache` termina
 * con un `NetworkOnly` comodín que capturaría todo lo demás.
 *
 * Estrategia: **Network-First con respaldo en caché** para los documentos
 * HTML. En un diario la frescura es un requisito de corrección (un titular
 * viejo desinforma), así que nunca se sirve caché teniendo red; pero cuando la
 * red falla —o tarda más de 6 s en móvil— se responde con la última copia
 * buena y, si no existe, con `/~offline`.
 *
 * Se reutiliza el nombre de caché `pages` de `defaultCache` para no duplicar
 * almacenamiento ni competir con las reglas de payload RSC.
 */
const reglasDiarioIA: RuntimeCaching[] = [
  {
    matcher: ({ request, url, sameOrigin }) =>
      sameOrigin &&
      request.destination === "document" &&
      !url.pathname.startsWith("/serwist/"),
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.html,
      networkTimeoutSeconds: 6,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 40,
          maxAgeSeconds: TREINTA_DIAS_EN_SEGUNDOS,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Actualización silenciosa en segundo plano: estándar de DiarioIA.
  // El Service Worker se activa inmediatamente (skipWaiting: true) y reclama
  // los clientes (clientsClaim: true) para precargar la edición del día y refrescar
  // recursos sin interrumpir al lector con alertas o diálogos intrusivos.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...reglasDiarioIA, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

/**
 * Calentamiento del app shell.
 *
 * `self.__SW_MANIFEST` precachea los estáticos con nombre hasheado (JS, CSS,
 * fuentes, iconos). La portada y `/guardados` NO se precachean a propósito: al
 * ir selladas con revisión, el precache las congelaría hasta 24 h (el navegador
 * solo comprueba si hay SW nuevo al navegar, con ese límite), y en un diario
 * eso equivale a enseñar la edición de ayer.
 *
 * En su lugar se siembran en la caché Network-First: se refrescan solas en cada
 * visita con red, pero ya están disponibles sin conexión desde la primera
 * instalación. Es best-effort: si no hay red, simplemente no se siembran.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await Promise.allSettled(
        APP_SHELL.map((url) =>
          serwist.handleRequest({
            request: new Request(url, { credentials: "same-origin" }),
            event,
          })
        )
      );
    })()
  );
});
